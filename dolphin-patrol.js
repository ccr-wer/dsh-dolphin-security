// ============================================================================
// dolphin-patrol.js —— Project Dolphin 的「主动巡检」融合控制器
// ----------------------------------------------------------------------------
// 把「眼睛」（dolphin-core.js / dsh-code-scan 的 scanDirectory）和
// 「手」（dolphin-ssh-core.js 的 createSshEngine）接到一起，形成最小闭环：
//
//   远程主机 ──(SSH)──▶ 执行 semgrep 扫描 ──▶ 回传结果 ──▶ 映射 SecurityFinding
//        └────────────────────────────────────────────▶ 存档 D:\Dolphin\reports\
//
// 用法：
//   node dolphin-patrol.js                        自检（无需真实主机）
//   node dolphin-patrol.js --local <目录>          本地真实扫描（需本机 semgrep）
//   node dolphin-patrol.js --patrol <alias> <远程目录>  远程巡逻（需先建主机）
//
// 远端 semgrep 部署策略（安全红线：绝不用 sudo / --break-system-packages）：
//   预装直用 → pipx（用户级隔离）→ /tmp 临时 venv → 便携 wheel 包 SFTP 上传
//   （离线安装到隔离目录）。所有临时目录在扫描结束后自动清理。
//   便携包缓存目录：DOLPHIN_SEMGREP_CACHE（默认 ~/.dolphin/semgrep-wheel-cache）。
// ============================================================================

import { createHostStore, createSshEngine } from './dolphin-ssh-core.js'
import { scanDirectory } from './dsh-code-scan/lib/scanner.js'
// 严重级别排序/统计/时间戳统一复用 dolphin-core 的实现（此前两处各存一份副本）
import { extractStructuredFindings, sortFindings, summarize, timestamp } from './dolphin-core.js'
import { mkdirSync, writeFileSync, existsSync, rmSync, statSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { tmpdir, homedir } from 'node:os'
import { spawnSync } from 'node:child_process'

// ---- 常量 -----------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPORTS_DIR = process.env.DOLPHIN_REPORTS_DIR ?? join(__dirname, 'reports')
// 默认规则集（空格分隔多包，--config 逐包展开）：security-audit 覆盖 CWE-78/489，
// owasp-top-ten 补齐其空白（CWE-79/89/22/95，见 docs/RULESET_RESEARCH.md 实测），
// rules/dolphin-core.yml 为自建的硬编码凭据规则（官方 registry 的
// hardcoded-password-default 已消失，CWE-798 全线漏报，故随 npm 包分发）。
// 自建规则用 __dirname 绝对路径：消费者在任意 cwd 运行时都能解析到包内文件，
// 远程巡逻时由规则上传逻辑（existsSync 检测）自动改写为远端路径。
const DEFAULT_RULES = `p/security-audit p/owasp-top-ten ${join(__dirname, 'rules', 'dolphin-core.yml')}`
const DEFAULT_SCAN_TIMEOUT = 120000
const DEFAULT_MAX_FINDINGS = 200

// 远端 semgrep 隔离部署：安装类操作（pipx / venv 内 pip）可能要从 PyPI 拉取
// semgrep 及其依赖（≈30MB），给足预算；探测类命令仍是秒级。
const PROBE_TIMEOUT = 8000
const PIPX_INSTALL_TIMEOUT = 300000
const VENV_SETUP_TIMEOUT = 300000
const PORTABLE_INSTALL_TIMEOUT = 300000

// 便携包本地缓存目录：跨平台巡逻只下载一次 Linux wheel，之后走本地缓存。
// 可用环境变量 DOLPHIN_SEMGREP_CACHE 覆盖；默认放用户目录，绝不写进仓库。
const WHEEL_CACHE_DIR = process.env.DOLPHIN_SEMGREP_CACHE ?? join(homedir(), '.dolphin', 'semgrep-wheel-cache')

// 便携包的目标平台：仅支持 Linux x86_64 远端（其余平台走 pipx/venv 或诚实报错）。
const WHEEL_PLATFORMS = ['manylinux2014_x86_64', 'manylinux_2_17_x86_64', 'manylinux_2_28_x86_64']

// 统一入口：把上游能力一并 re-export，调用方只需 import 这一个文件。
export { createHostStore, createSshEngine } from './dolphin-ssh-core.js'
export { scanDirectory } from './dsh-code-scan/lib/scanner.js'
export { extractStructuredFindings } from './dolphin-core.js'

// ---- 小工具 ---------------------------------------------------------------
const msg = (e) => (e instanceof Error ? e.message : String(e))

// POSIX shell 单引号转义：targetDir / rulesConfig 都可能来自用户输入，
// 拼进远程命令字符串前必须转义，否则空格、$()、; 会注入命令。
function shellQuote(value) {
  const s = String(value)
  if (s === '') return "''"
  // 只含安全字符（路径 / 冒号 / 等号 / @ 等）时原样返回，可读性更好
  if (/^[A-Za-z0-9_./:=@%+,-]+$/.test(s)) return s
  return "'" + s.replace(/'/g, "'\\''") + "'"
}

// ============================================================================
// 2. buildRemoteScanCommand —— 生成远程 semgrep 扫描命令（纯函数）
// ----------------------------------------------------------------------------
// 规则集注入与本地扫描器（scanner.js 的 buildSemgrepArgs）保持同一语义：
//   有 rulesConfig → semgrep scan --config <rc1> --config <rc2> ... <targetDir> --json
//   无 rulesConfig → semgrep scan <targetDir> --json
// rulesConfig 支持空格分隔多规则包/文件（'p/a p/b rules/x.yml'），逐包展开。
// semgrepCmd：远端 semgrep 可执行入口。默认 'semgrep'（PATH 解析）；
//   隔离部署成功后由 provisionRemoteSemgrep 给出显式路径或「前缀」
//   （如 'PYTHONPATH=<pkg> python3 -m semgrep'），本函数原样拼在首位。
// ============================================================================
export function buildRemoteScanCommand(targetDir, rulesConfig, semgrepCmd = 'semgrep') {
  const parts = [semgrepCmd, 'scan']
  if (rulesConfig) {
    String(rulesConfig).split(/\s+/).filter(Boolean).forEach((rc) => parts.push('--config', shellQuote(rc)))
  }
  parts.push(shellQuote(targetDir), '--json')
  return parts.join(' ')
}

// ============================================================================
// 3. 远程 semgrep 探测
// ============================================================================
async function detectRemoteSemgrep(engine, alias) {
  const probe = await engine.exec(
    alias,
    'command -v semgrep >/dev/null 2>&1 && printf HAS || printf NONE',
    PROBE_TIMEOUT,
    1,
  )
  return probe.success && probe.stdout.includes('HAS')
}

// ============================================================================
// 3.5 远端 semgrep 隔离部署层（pipx → venv → 便携包，绝不提权）
// ----------------------------------------------------------------------------
// 安全红线（写入 README「安全部署」章节）：
//   * 全链路【禁止】sudo、【禁止】pip install --break-system-packages、
//     【禁止】任何写入系统 site-packages 的操作。
//   * assertNoPrivilegeEscalation 是硬闸门：每条远端命令下发前都会过一遍，
//     命中红线直接抛错，宁可失败也绝不污染生产系统。
//
// 策略优先级（风险/收益从高到低）：
//   1. preinstalled —— 远端 PATH 里已有 semgrep，零成本直接用。
//   2. pipx        —— 有 pipx 则 `pipx install semgrep`：装进用户级隔离区
//                     （~/.local/share/pipx），持久、可复用、不碰系统 Python。
//                     代价：远端需从 PyPI 下载 ≈30MB，上传 0 字节。
//   3. venv        —— 无 pipx 但有 python3 时，建临时虚拟环境
//                     /tmp/dolphin-venv-<ts> 再在里面 pip install semgrep；
//                     完全隔离，扫描结束随临时目录一起清理。
//                     代价：同上 ≈30MB 远端下载 + venv 构建 ≈30s。
//   4. portable    —— 最终回退：远端不装任何东西。用本地缓存的 Linux wheel
//                     包（DOLPHIN_SEMGREP_CACHE，首次自动 pip download，之后
//                     走缓存）经 SFTP 上传到远端临时目录，`pip --no-index
//                     --target` 离线安装进隔离目录（远端无 pip 时退化为
//                     zipfile 解包 + PYTHONPATH 直跑）。上传字节数在预检中
//                     明确给出，扫描结束随临时目录一起清理。
// ============================================================================

// 硬闸门：任何含提权/系统污染语义的命令一律拦截。
export function assertNoPrivilegeEscalation(command) {
  const s = String(command)
  if (/\bsudo\b/.test(s)) {
    throw new Error(`安全红线：检测到 sudo，已阻止下发 —— ${s.slice(0, 120)}`)
  }
  if (s.includes('--break-system-packages')) {
    throw new Error(`安全红线：检测到 --break-system-packages，已阻止下发 —— ${s.slice(0, 120)}`)
  }
  return true
}

// 统一的安全下发通道：所有部署类命令都必须走这里。
async function safeExec(engine, alias, command, timeoutMs) {
  assertNoPrivilegeEscalation(command)
  return engine.exec(alias, command, timeoutMs, 1)
}

// 探测远端某个能力是否存在（command -v 的探测命令，固定模板防注入）。
async function probeHasCommand(engine, alias, bin) {
  if (!/^[A-Za-z0-9_.-]+$/.test(bin)) throw new Error(`非法探测目标：${bin}`)
  const r = await safeExec(engine, alias, `command -v ${bin} >/dev/null 2>&1 && printf HAS || printf NONE`, PROBE_TIMEOUT)
  return r.success && r.stdout.includes('HAS')
}

// 风险/收益评估（纯函数）：在真正下发部署命令之前给出可读的预检结论。
export function assessDeploymentPlan(strategy, { uploadBytes = 0, remoteDownloadBytes = 0 } = {}) {
  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`
  const base = { strategy, uploadBytes, remoteDownloadBytes }
  switch (strategy) {
    case 'preinstalled':
      return { ...base, riskLevel: '无', rationale: '远端已有 semgrep，零部署成本' }
    case 'pipx':
      return { ...base, riskLevel: '低', rationale: `上传 0 字节；远端从 PyPI 拉取 ≈${mb(remoteDownloadBytes)} 装入用户级隔离区（pipx），可复用、不碰系统 Python` }
    case 'venv':
      return { ...base, riskLevel: '低', rationale: `上传 0 字节；远端拉取 ≈${mb(remoteDownloadBytes)} 装入 /tmp 临时 venv，扫描结束自动清理` }
    case 'portable':
      return { ...base, riskLevel: '中（有上传流量）', rationale: `SFTP 上传 ≈${mb(uploadBytes)} 的 wheel 包；远端仅离线安装到 /tmp 隔离目录，扫描结束自动清理` }
    default:
      return { ...base, riskLevel: '未知', rationale: '未知策略' }
  }
}

// 本地准备 Linux wheel 便携包（带缓存）：首次用本机 pip download 按
// manylinux 平台拉取 semgrep 及全部依赖 wheel，之后命中缓存零下载。
// 返回 { files:[{path,size}], totalBytes, fromCache, error? }。
export function prepareWheelBundle(cacheDir = WHEEL_CACHE_DIR, pythonVersion = '3.11') {
  mkdirSync(cacheDir, { recursive: true })
  const existing = readdirSync(cacheDir).filter((f) => f.endsWith('.whl'))
  if (existing.length > 0) {
    const files = existing.map((f) => ({ path: join(cacheDir, f), size: statSync(join(cacheDir, f)).size }))
    return { files, totalBytes: files.reduce((a, f) => a + f.size, 0), fromCache: true }
  }
  // 本机 pip download：--only-binary + --platform 强制拉 Linux x86_64 wheel，
  // 与本机操作系统无关（Windows 本机也能为 Linux 远端备货）。
  const args = [
    '-m', 'pip', 'download', 'semgrep',
    '--only-binary=:all:',
    ...WHEEL_PLATFORMS.flatMap((p) => [`--platform=${p}`]),
    `--python-version=${pythonVersion}`,
    '--implementation=cp',
    `--abi=cp${pythonVersion.replace('.', '')}`, '--abi=abi3', '--abi=none',
    '-d', cacheDir, '--quiet',
  ]
  let last = null
  for (const bin of ['python', 'python3']) {
    const r = spawnSync(bin, args, { encoding: 'utf8' })
    if (r.status === 0) { last = r; break }
    last = r
  }
  const wheels = readdirSync(cacheDir).filter((f) => f.endsWith('.whl'))
  if (wheels.length === 0) {
    return { files: [], totalBytes: 0, fromCache: false, error: `pip download 失败：${(last?.stderr || last?.error?.message || '未知原因').slice(0, 200)}` }
  }
  const files = wheels.map((f) => ({ path: join(cacheDir, f), size: statSync(join(cacheDir, f)).size }))
  return { files, totalBytes: files.reduce((a, f) => a + f.size, 0), fromCache: false }
}

// 便携包离线安装的远端命令组（纯函数，便于单测）。
// 优先 pip --no-index --target（隔离目录，不碰系统）；无 pip 则 zipfile 解包。
export function buildPortableInstallCommands(bundleDir, pkgDir) {
  return {
    viaPip: `python3 -m pip install --no-index --no-cache-dir --find-links ${shellQuote(bundleDir)} --target ${shellQuote(pkgDir)} semgrep`,
    viaZipfile: `python3 -c "import zipfile,glob; [zipfile.ZipFile(w).extractall(${JSON.stringify(pkgDir)}) for w in glob.glob(${JSON.stringify(bundleDir)} + '/*.whl')]"`,
  }
}

/**
 * 远端 semgrep 隔离部署主入口。已探测到远端无 semgrep 时调用。
 * （导出：供上层工具复用与实测；常规巡逻由 runPatrol 内部调用。）
 * @returns {Promise<{ok:boolean, strategy?:string, semgrepCmd?:string,
 *   uploadBytes:number, remoteDownloadBytes:number, cleanupDirs:string[],
 *   notes:string[], error?:string}>}
 */
export async function provisionRemoteSemgrep(engine, alias, { console } = {}) {
  const out = { ok: false, uploadBytes: 0, remoteDownloadBytes: 0, cleanupDirs: [], notes: [] }
  const say = (s) => { out.notes.push(s); console?.log?.(`  [deploy] ${s}`) }

  // ---- 策略 2：pipx（用户级隔离，持久可复用）--------------------------------
  try {
    if (await probeHasCommand(engine, alias, 'pipx')) {
      say('策略 pipx：检测到 pipx，安装 semgrep 到用户级隔离区（远端拉取 ≈30MB，预计 1-3 分钟）')
      const inst = await safeExec(engine, alias, 'pipx install semgrep', PIPX_INSTALL_TIMEOUT)
      if (inst.exitCode === 0 || /already installed/i.test(inst.stdout + inst.stderr)) {
        const v = await safeExec(engine, alias, '$HOME/.local/bin/semgrep --version', PROBE_TIMEOUT)
        if (v.exitCode === 0) {
          out.ok = true; out.strategy = 'pipx'; out.semgrepCmd = '$HOME/.local/bin/semgrep'
          out.remoteDownloadBytes = 30 * 1024 * 1024
          say('策略 pipx：安装并验证成功')
          return out
        }
        say('策略 pipx：安装命令成功但 semgrep --version 验证失败，转下一策略')
      } else {
        say(`策略 pipx：安装失败（${(inst.stderr || inst.stdout || '').slice(0, 120)}），转下一策略`)
      }
    } else {
      say('策略 pipx：远端无 pipx，跳过')
    }
  } catch (e) { say(`策略 pipx：异常（${msg(e)}），转下一策略`) }

  // ---- 策略 3：临时 venv（/tmp 隔离，扫描结束清理）--------------------------
  let venvDir = null
  try {
    if (await probeHasCommand(engine, alias, 'python3')) {
      venvDir = `/tmp/dolphin-venv-${Date.now()}`
      say(`策略 venv：构建临时虚拟环境 ${venvDir}（远端拉取 ≈30MB，预计 1-3 分钟）`)
      const mk = await safeExec(engine, alias, `python3 -m venv ${shellQuote(venvDir)}`, VENV_SETUP_TIMEOUT)
      if (mk.exitCode === 0) {
        out.cleanupDirs.push(venvDir)
        const pi = await safeExec(engine, alias, `${shellQuote(venvDir + '/bin/pip')} install --quiet semgrep`, VENV_SETUP_TIMEOUT)
        if (pi.exitCode === 0) {
          const v = await safeExec(engine, alias, `${shellQuote(venvDir + '/bin/semgrep')} --version`, PROBE_TIMEOUT)
          if (v.exitCode === 0) {
            out.ok = true; out.strategy = 'venv'; out.semgrepCmd = shellQuote(venvDir + '/bin/semgrep')
            out.remoteDownloadBytes = 30 * 1024 * 1024
            say('策略 venv：安装并验证成功')
            return out
          }
          say('策略 venv：pip 安装成功但 semgrep --version 验证失败，转下一策略')
        } else {
          say(`策略 venv：pip install 失败（${(pi.stderr || pi.stdout || '').slice(0, 120)}），转下一策略`)
        }
      } else {
        say(`策略 venv：python3 -m venv 失败（${(mk.stderr || mk.stdout || '').slice(0, 120)}，远端可能缺 python3-venv），转下一策略`)
      }
    } else {
      say('策略 venv：远端无 python3，跳过')
    }
  } catch (e) { say(`策略 venv：异常（${msg(e)}），转下一策略`) }

  // ---- 策略 4：便携包 SFTP 上传（远端零安装、零系统写入）--------------------
  let bundleDir = null
  try {
    if (!(await probeHasCommand(engine, alias, 'python3'))) {
      say('策略 portable：远端无 python3，无法运行任何形态的 semgrep，全部策略失败')
      out.error = '远端无 semgrep，且无 pipx / python3，无法以任何隔离方式部署（拒绝使用 sudo / --break-system-packages）'
      return out
    }
    // 远端 python 版本决定 wheel 选择（major*100+minor → '3.12' 形式）
    const pv = await safeExec(engine, alias, 'python3 -c "import sys;print(\'%d.%d\' % sys.version_info[:2])"', PROBE_TIMEOUT)
    const pyVer = /3\.\d+/.test(pv.stdout.trim()) ? pv.stdout.trim().match(/3\.\d+/)[0] : '3.11'

    say(`策略 portable：准备本地 wheel 便携包（目标平台 manylinux x86_64 / python ${pyVer}）`)
    const bundle = prepareWheelBundle(WHEEL_CACHE_DIR, pyVer)
    if (bundle.error || bundle.files.length === 0) {
      out.error = `便携包准备失败：${bundle.error ?? '缓存为空且下载失败'}；可手动执行 pip download semgrep --only-binary=:all: --platform manylinux2014_x86_64 --python-version ${pyVer} -d ${WHEEL_CACHE_DIR}`
      return out
    }
    out.uploadBytes = bundle.totalBytes
    say(`策略 portable：共 ${bundle.files.length} 个 wheel、${(bundle.totalBytes / 1024 / 1024).toFixed(1)}MB（${bundle.fromCache ? '本地缓存命中' : '首次下载并缓存'}），开始 SFTP 上传`)

    bundleDir = `/tmp/dolphin-wheelbundle-${Date.now()}`
    const pkgDir = `/tmp/dolphin-sempkg-${Date.now()}`
    out.cleanupDirs.push(bundleDir, pkgDir)
    await safeExec(engine, alias, `mkdir -p ${shellQuote(bundleDir)}`, PROBE_TIMEOUT)
    for (const f of bundle.files) {
      await engine.upload(alias, f.path, `${bundleDir}/${f.path.split(/[\\/]/).pop()}`, false)
    }
    say('策略 portable：上传完成，离线安装到 /tmp 隔离目录（--no-index --target，不碰系统）')

    const cmds = buildPortableInstallCommands(bundleDir, pkgDir)
    let ins = await safeExec(engine, alias, cmds.viaPip, PORTABLE_INSTALL_TIMEOUT)
    let semgrepCmd = `PYTHONPATH=${pkgDir} ${pkgDir}/bin/semgrep`
    if (ins.exitCode !== 0) {
      say(`策略 portable：pip 离线安装不可用（${(ins.stderr || ins.stdout || '').slice(0, 120)}），退化为 zipfile 解包`)
      ins = await safeExec(engine, alias, cmds.viaZipfile, PORTABLE_INSTALL_TIMEOUT)
      semgrepCmd = `PYTHONPATH=${pkgDir} python3 -m semgrep`
    }
    const v = await safeExec(engine, alias, `${semgrepCmd} --version`, PROBE_TIMEOUT)
    if (ins.exitCode === 0 && v.exitCode === 0) {
      out.ok = true; out.strategy = 'portable'; out.semgrepCmd = semgrepCmd
      say('策略 portable：离线安装并验证成功')
      return out
    }
    out.error = `便携包安装/验证失败：${(ins.stderr || ins.stdout || v.stderr || '').slice(0, 200)}`
    return out
  } catch (e) {
    out.error = `策略 portable：异常（${msg(e)}）`
    return out
  } finally {
    // 便携包中途失败也要回收已上传的临时目录（venv 目录若已建同样回收）。
    if (!out.ok && out.cleanupDirs.length) {
      try {
        await engine.exec(alias, `rm -rf ${out.cleanupDirs.map(shellQuote).join(' ')}`, 15000, 1)
        out.cleanupDirs = []
      } catch { /* 尽力而为：回收失败不掩盖主错误 */ }
    }
  }
}

// ============================================================================
// 4. （已并入 3.5）原「node runner fallback」说明
// ----------------------------------------------------------------------------
// 旧方案在远端无 semgrep 时上传 scanner.mjs + runner.mjs 用 node 执行，但
// scanner.js 底层仍调用 semgrep 二进制 —— 远端真没 semgrep 时它必然失败，
// 语义上是死路径。现由 3.5 的隔离部署层（pipx → venv → 便携包）完整取代：
// 三条策略都能在「远端无 semgrep」时真正交付可用的 semgrep。
// ============================================================================

// ============================================================================
// 5. runPatrol —— 巡逻闭环
// ----------------------------------------------------------------------------
// @param {string} alias      已登记的主机别名（见 createHostStore / store.create）
// @param {string} targetDir  远端要扫描的绝对目录（如 /var/www/app）
// @param {object} [options]  { rulesConfig, scanTimeoutMs, maxFindings,
//                              reportsDir, engine, store }
//   engine/store：依赖注入，便于测试；缺省时用默认主机库自建引擎。
// @returns 见返回值注释。
// ============================================================================
export async function runPatrol(alias, targetDir, options = {}) {
  const rulesConfig = options.rulesConfig ?? DEFAULT_RULES
  const scanTimeoutMs = options.scanTimeoutMs ?? DEFAULT_SCAN_TIMEOUT
  const maxFindings = options.maxFindings ?? DEFAULT_MAX_FINDINGS
  const reportsDir = options.reportsDir ?? REPORTS_DIR
  // 引擎归属判定：自建引擎用完必须 dispose()，否则 ssh2 连接 + keepalive 定时器会
  // 挂住 Node 事件循环，进程跑完卡住不退出（CLI 场景实测如此）。注入的引擎
  // （测试用）由调用方负责释放，这里不越权关闭。
  const injectedEngine = options.engine !== undefined
  const engine = injectedEngine ? options.engine : createSshEngine(options.store ?? createHostStore())
  // 部署记录：策略/字节量/待清理目录。声明在 try 外，finally 的自动清理要读它。
  let deploy = null

  try {
    // 1. 连通性检查（echo ok，5s 预算）
    const check = await engine.test(alias)
    if (!check.ok) {
      return { ok: false, stage: 'healthcheck', host: alias, error: check.error }
    }

    // 2. 预检（最迟在部署/下发扫描之前做完）：
    //    a) 远端目标目录存在性 —— 避免白装一套 semgrep 才发现扫了个空路径。
    const pf = await engine.exec(alias, `test -d ${shellQuote(targetDir)} && printf OK || printf MISSING`, PROBE_TIMEOUT, 1)
    if (!pf.success || !pf.stdout.includes('OK')) {
      return { ok: false, stage: 'preflight', host: alias, error: `远端目录不存在或不可访问：${targetDir}` }
    }

    //    b) 探测远程是否装了 semgrep
    let hasSemgrep = false
    try {
      hasSemgrep = await detectRemoteSemgrep(engine, alias)
    } catch (e) {
      return { ok: false, stage: 'detect', host: alias, error: msg(e) }
    }

    //    c) 规则文件部署：rulesConfig 逐 token 检查，指向本地文件的（如
    //       rules/dolphin-core.yml）上传到远端临时目录并改写为远端路径；
    //       registry 规则包（p/xxx）原样透传。远端 semgrep 读不到控制端本地路径。
    let remoteRules = rulesConfig
    const rulesCleanup = []
    if (typeof rulesConfig === 'string' && rulesConfig.trim() !== '') {
      const tokens = rulesConfig.split(/\s+/).filter(Boolean)
      const localTokens = tokens.filter((t) => existsSync(resolve(t)))
      if (localTokens.length) {
        const rulesDir = `/tmp/dolphin-rules-${Date.now()}`
        try {
          await engine.exec(alias, `mkdir -p ${shellQuote(rulesDir)}`, PROBE_TIMEOUT, 1)
          const mapped = []
          for (const t of tokens) {
            if (existsSync(resolve(t))) {
              const dest = `${rulesDir}/${resolve(t).split(/[\\/]/).pop()}`
              await engine.upload(alias, resolve(t), dest, false)
              mapped.push(dest)
            } else {
              mapped.push(t)
            }
          }
          remoteRules = mapped.join(' ')
          rulesCleanup.push(rulesDir)
        } catch (e) {
          return { ok: false, stage: 'preflight', host: alias, error: `规则文件上传失败：${msg(e)}` }
        }
      }
    }

    // 3. 确定 semgrep 入口：预装直用；缺失则走隔离部署链（pipx→venv→便携包）。
    //    部署前输出预检结论：策略、上传字节、远端下载量、风险等级与处置。
    if (hasSemgrep) {
      deploy = { ok: true, strategy: 'preinstalled', semgrepCmd: 'semgrep', uploadBytes: 0, remoteDownloadBytes: 0, cleanupDirs: rulesCleanup, notes: ['远端已预装 semgrep，零部署成本'] }
    } else {
      deploy = await provisionRemoteSemgrep(engine, alias)
      if (deploy.ok) deploy.cleanupDirs.push(...rulesCleanup)
      if (!deploy.ok) {
        return { ok: false, stage: 'deploy', host: alias, error: deploy.error, deploy: { strategy: '失败', notes: deploy.notes } }
      }
    }
    if (!hasSemgrep) {
      const plan = assessDeploymentPlan(deploy.strategy, deploy)
      console.log(`[Dolphin] 部署预检：策略=${plan.strategy} | 上传 ${plan.uploadBytes} 字节 | 远端下载 ≈${(plan.remoteDownloadBytes / 1024 / 1024).toFixed(1)}MB | 风险=${plan.riskLevel}`)
      console.log(`[Dolphin] 预检结论：${plan.rationale}`)
      for (const n of deploy.notes) console.log(`[Dolphin]   ${n}`)
    }

    // 4. 执行远程扫描
    //    attempts 固定传 1：扫描是只读幂等操作，断线重连重放只会浪费一次完整扫描，
    //    宁可失败上报，也不静默重扫。
    let rawResults
    {
      const cmd = buildRemoteScanCommand(targetDir, remoteRules, deploy.semgrepCmd)
      let r
      try {
        r = await engine.exec(alias, cmd, scanTimeoutMs, 1)
      } catch (e) {
        return { ok: false, stage: 'scan', host: alias, error: msg(e) }
      }
      if (r.timedOut) {
        return { ok: false, stage: 'scan', host: alias, error: `扫描超时（${scanTimeoutMs}ms），请缩小扫描范围` }
      }
      // semgrep 退出码语义：0=无问题 1=有问题（stdout 仍是完整 JSON）2=失败。
      // 因此按 exitCode 判断，而不是 exec 返回的 success（exitCode 1 时 success=false）。
      if (r.exitCode === 2) {
        return { ok: false, stage: 'scan', host: alias, error: `semgrep 扫描失败：${(r.stderr || '').slice(0, 300)}` }
      }
      if (r.exitCode !== 0 && r.exitCode !== 1) {
        return { ok: false, stage: 'scan', host: alias, error: `远程命令异常退出码 ${r.exitCode}` }
      }
      let parsed
      try {
        parsed = JSON.parse(r.stdout)
      } catch {
        return { ok: false, stage: 'parse', host: alias, error: '远程输出无法解析为 JSON（可能被截断或版本不兼容）' }
      }
      rawResults = parsed.results ?? []
    }

    // 4. 映射为 Dolphin 统一 SecurityFinding（复用 dolphin-core 的提取器 + 补 host 维度）
    const findings = sortFindings(extractStructuredFindings(rawResults)).map((f) => ({ host: alias, ...f }))
    const total = findings.length
    const truncated = total > maxFindings
    const shown = truncated ? findings.slice(0, maxFindings) : findings

    // 5. 存档到 reports/（结构化 JSON，可直接消费）
    const ts = timestamp()
    const reportFile = join(reportsDir, `patrol-${alias}-${ts}.json`)
    mkdirSync(reportsDir, { recursive: true })
    writeFileSync(
      reportFile,
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        host: alias,
        targetDir,
        rulesConfig,
        deploy: {
          strategy: deploy.strategy,
          uploadBytes: deploy.uploadBytes,
          remoteDownloadBytes: deploy.remoteDownloadBytes,
          notes: deploy.notes,
        },
        total,
        truncated,
        summary: summarize(shown),
        findings: shown,
      }, null, 2),
      'utf8',
    )

    return {
      ok: true,
      host: alias,
      targetDir,
      rulesConfig,
      total,
      truncated,
      shown: shown.length,
      summary: summarize(shown),
      reportFile,
      findings: shown,
    }
  } finally {
    // 临时目录自动清理（venv / 便携包 / 规则文件目录）：必须在引擎释放前执行。
    // 尽力而为：单条清理失败不影响主流程结果，只打警告。
    const dirs = deploy?.cleanupDirs ?? []
    if (dirs.length) {
      try {
        const c = await engine.exec(alias, `rm -rf ${dirs.map(shellQuote).join(' ')}`, 15000, 1)
        if (c.exitCode === 0) {
          console.log(`[Dolphin] 已自动清理远端临时目录：${dirs.join(', ')}`)
        } else {
          console.log(`[Dolphin] ⚠ 临时目录清理未确认完成（exit=${c.exitCode}）：${dirs.join(', ')}`)
        }
      } catch (e) {
        console.log(`[Dolphin] ⚠ 临时目录清理失败（不影响扫描结果）：${msg(e)}`)
      }
    }
    // 自建引擎用完即释放，避免 ssh2 连接 + keepalive 定时器挂住事件循环。
    if (!injectedEngine) engine.dispose()
  }
}

// ============================================================================
// 6. runLocalScan —— 本地扫描（直接复用 scanDirectory 的「扫描层」）
// ----------------------------------------------------------------------------
// 远端不可达、或目标目录就在本机时使用。同样映射 SecurityFinding 并存档。
// ============================================================================
export async function runLocalScan(targetDir, options = {}) {
  const rulesConfig = options.rulesConfig ?? DEFAULT_RULES
  const timeoutMs = options.timeoutMs ?? DEFAULT_SCAN_TIMEOUT
  const maxFindings = options.maxFindings ?? DEFAULT_MAX_FINDINGS
  const reportsDir = options.reportsDir ?? REPORTS_DIR

  const outcome = await scanDirectory(targetDir, { rulesConfig, timeoutMs, maxFindings, raw: true })
  if (!outcome.ok) return { ok: false, host: 'local', error: outcome.message }

  const findings = sortFindings(extractStructuredFindings(outcome.rawResults)).map((f) => ({ host: 'local', ...f }))
  const total = findings.length
  const truncated = total > maxFindings
  const shown = truncated ? findings.slice(0, maxFindings) : findings

  const reportFile = join(reportsDir, `patrol-local-${timestamp()}.json`)
  mkdirSync(reportsDir, { recursive: true })
  writeFileSync(
    reportFile,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      host: 'local',
      targetDir: resolve(targetDir),
      rulesConfig,
      total,
      truncated,
      summary: summarize(shown),
      findings: shown,
    }, null, 2),
    'utf8',
  )

  return {
    ok: true,
    host: 'local',
    targetDir: resolve(targetDir),
    rulesConfig,
    total,
    truncated,
    shown: shown.length,
    summary: summarize(shown),
    reportFile,
    findings: shown,
  }
}

// ============================================================================
// 7. test —— 自检接口（无网络依赖，供后续验证）
// ============================================================================
export async function test() {
  const results = []
  const check = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail })
    console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail !== undefined && detail !== '' ? `  →  ${detail}` : ''}`)
  }

  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║  dolphin-patrol.js  自检                                             ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n')

  // 1. 接口暴露
  console.log('【1】接口暴露')
  check('导出 runPatrol', typeof runPatrol === 'function')
  check('导出 buildRemoteScanCommand', typeof buildRemoteScanCommand === 'function')
  check('导出 runLocalScan', typeof runLocalScan === 'function')
  check('导出 test', typeof test === 'function')
  check('re-export createSshEngine', typeof createSshEngine === 'function')
  check('re-export scanDirectory', typeof scanDirectory === 'function')
  check('re-export extractStructuredFindings', typeof extractStructuredFindings === 'function')

  // 2. buildRemoteScanCommand
  console.log('\n【2】buildRemoteScanCommand')
  const c1 = buildRemoteScanCommand('/var/www/app', 'p/security-audit')
  check('含 semgrep scan', c1.startsWith('semgrep scan'), c1)
  check('含 --config', c1.includes('--config'))
  check('含 --json', c1.includes('--json'))
  check('含 targetDir', c1.includes('/var/www/app'))
  const c2 = buildRemoteScanCommand('/var/www/app', null)
  check('无规则集时省略 --config', !c2.includes('--config'), c2)
  const c3 = buildRemoteScanCommand('/var/www/my app', 'p/x')
  check('含空格路径被引号包裹', c3.includes("'/var/www/my app'"), c3)
  const c4 = buildRemoteScanCommand('/x', "p/foo'; rm -rf /tmp/x; #")
  // 多 token 语义：含空格的 rulesConfig 被拆成多个 --config；每段仍经 shellQuote，
  // 恶意串（rm -rf 等）沦为 --config 的字面参数值，注入被中性化。
  check('恶意规则集被拆分转义（rm -rf 沦为 config 值）', c4 === "semgrep scan --config 'p/foo'\\'';' --config rm --config -rf --config '/tmp/x;' --config '#' /x --json", c4)
  const c7 = buildRemoteScanCommand('/x', 'p/security-audit p/owasp-top-ten rules/dolphin-core.yml')
  check('多规则包逐包展开 --config', c7 === "semgrep scan --config p/security-audit --config p/owasp-top-ten --config rules/dolphin-core.yml /x --json", c7)

  // 3. SecurityFinding 映射（复用 extractStructuredFindings + host 维度）
  console.log('\n【3】SecurityFinding 映射')
  const sample = [
    {
      check_id: 'python.lang.security.audit.sql-injection.sql-injection',
      path: 'demo/app.py',
      start: { line: 30, col: 9 },
      end: { line: 30, col: 45 },
      extra: {
        severity: 'ERROR',
        message: 'Detected SQL statement that is tainted by user input.',
        metadata: { category: 'security', cwe: ['CWE-89'] },
        lines: '    cur.execute("SELECT * FROM users WHERE id=" + uid)',
      },
    },
    {
      check_id: 'generic.ci.security.use-of-md5.use-of-md5',
      path: 'demo/hash.js',
      start: { line: 8, col: 1 },
      end: { line: 8, col: 28 },
      extra: {
        severity: 'WARNING',
        message: 'Detected use of the weak hash function MD5.',
        metadata: { category: 'crypto', cwe: ['CWE-328'] },
        lines: "const h = crypto.createHash('md5')",
      },
    },
  ]
  const mapped = sortFindings(extractStructuredFindings(sample)).map((f) => ({ host: 'demo', ...f }))
  check('映射数量', mapped.length === 2, `${mapped.length} 条`)
  check('映射字段完整', mapped.every((f) => f.host && f.file && typeof f.line === 'number' && f.severity && f.checkId && f.message !== undefined))
  check('映射含 codeSnippet/remediationHint', mapped.every((f) => 'codeSnippet' in f && 'remediationHint' in f))
  check('ERROR 优先排序', mapped[0].severity === 'ERROR', mapped.map((f) => f.severity).join(','))

  // 4. 健康检查降级（坏 alias，不碰网络）
  console.log('\n【4】runPatrol 健康检查降级')
  const tmpStore = createHostStore(join(tmpdir(), `dolphin-patrol-hosts-${Date.now()}.json`))
  const tmpEngine = createSshEngine(tmpStore)
  const bad = await runPatrol('no-such-alias-xyz', '/tmp/x', { engine: tmpEngine })
  check('坏 alias 健康检查降级', bad.ok === false && bad.stage === 'healthcheck', bad.error)
  tmpEngine.dispose()

  // 5. 存档 dry-run
  //    注意：这一节会真实调用本机 semgrep（runLocalScan → scanDirectory），
  //    semgrep 未安装时 scanDirectory 是友好降级（ok=false）而非抛错，
  //    因此这里判定为 SKIP 而不是 FAIL —— 否则"无需 semgrep 即可自检"的承诺会失效。
  //    超时给到 60s：semgrep 冷启动（首次加载规则集）可能远超 30s。
  console.log('\n【5】存档 dry-run（依赖本机 semgrep）')
  const dryReports = join(tmpdir(), `dolphin-patrol-reports-${Date.now()}`)
  const emptyDir = join(tmpdir(), `dolphin-patrol-empty-${Date.now()}`)
  mkdirSync(emptyDir, { recursive: true })
  const local = await runLocalScan(emptyDir, { reportsDir: dryReports, timeoutMs: 60000 })
  if (local.ok === false && /未检测到 semgrep/.test(local.error ?? '')) {
    console.log('  [SKIP] 本机未安装 semgrep，跳过存档 dry-run（pip install semgrep 后可完整自检）')
  } else {
    check('本地扫描返回 ok', local.ok === true, local.error)
    check('存档文件已生成', existsSync(local.reportFile), local.reportFile)
    check('空目标 total=0', local.total === 0, `total=${local.total}`)
  }
  rmSync(emptyDir, { recursive: true, force: true })
  rmSync(dryReports, { recursive: true, force: true })

  // 6. 隔离部署层纯函数自检（无网络依赖）
  console.log('\n【6】隔离部署层（pipx → venv → 便携包）')
  check('导出 assertNoPrivilegeEscalation', typeof assertNoPrivilegeEscalation === 'function')
  check('导出 assessDeploymentPlan', typeof assessDeploymentPlan === 'function')
  check('导出 prepareWheelBundle', typeof prepareWheelBundle === 'function')
  check('导出 buildPortableInstallCommands', typeof buildPortableInstallCommands === 'function')

  // 安全红线：sudo 与 --break-system-packages 必须被拦截
  let blocked = false
  try { assertNoPrivilegeEscalation('sudo pip install semgrep') } catch { blocked = true }
  check('拦截 sudo 安装', blocked)
  blocked = false
  try { assertNoPrivilegeEscalation('pip install --break-system-packages semgrep') } catch { blocked = true }
  check('拦截 --break-system-packages', blocked)
  check('放行普通命令', assertNoPrivilegeEscalation('pipx install semgrep') === true)
  blocked = false
  try { assertNoPrivilegeEscalation('echo ok | sudo pip install x') } catch { blocked = true }
  check('拦截管道后置 sudo', blocked)

  // buildRemoteScanCommand 支持自定义 semgrep 入口（隔离部署产物）
  const c5 = buildRemoteScanCommand('/var/www/app', null, '/tmp/dolphin-venv-1/bin/semgrep')
  check('venv 入口被拼进扫描命令', c5.startsWith('/tmp/dolphin-venv-1/bin/semgrep scan'), c5)
  const c6 = buildRemoteScanCommand('/var/www/app', null, 'PYTHONPATH=/tmp/pkg python3 -m semgrep')
  check('便携包 PYTHONPATH 入口被拼进扫描命令', c6.startsWith('PYTHONPATH=/tmp/pkg python3 -m semgrep scan'), c6)

  // 便携包离线安装命令：必须 --no-index（不碰网络）、--target（不碰系统）
  const pc = buildPortableInstallCommands('/tmp/wheels', '/tmp/pkg')
  check('离线安装含 --no-index --target', pc.viaPip.includes('--no-index') && pc.viaPip.includes('--target'), pc.viaPip.slice(0, 90))
  check('离线安装不含 sudo / --break-system-packages', !pc.viaPip.includes('sudo') && !pc.viaPip.includes('--break-system-packages'))

  // 风险/收益评估
  const a1 = assessDeploymentPlan('pipx', { remoteDownloadBytes: 30 * 1024 * 1024 })
  check('pipx 评估为低风险 0 上传', a1.riskLevel === '低' && a1.uploadBytes === 0, a1.rationale.slice(0, 60))
  const a2 = assessDeploymentPlan('portable', { uploadBytes: 40 * 1024 * 1024 })
  check('portable 评估标注上传流量', a2.riskLevel.includes('上传'), a2.rationale.slice(0, 60))

  // 便携包缓存命中路径（放一个假 .whl 到临时缓存目录，不触发网络）
  const fakeCache = join(tmpdir(), `dolphin-wheel-cache-test-${Date.now()}`)
  mkdirSync(fakeCache, { recursive: true })
  writeFileSync(join(fakeCache, 'semgrep-0.0.0-py3-none-any.whl'), 'fake', 'utf8')
  const wb = prepareWheelBundle(fakeCache, '3.11')
  check('便携包缓存命中（不联网）', wb.fromCache === true && wb.files.length === 1 && wb.totalBytes === 4)
  rmSync(fakeCache, { recursive: true, force: true })

  const pass = results.filter((r) => r.pass).length
  const fail = results.length - pass
  console.log('\n──────────────────────────────────────────────────────────────────────')
  console.log(`自检结束：${pass} 通过 / ${fail} 失败`)
  console.log('──────────────────────────────────────────────────────────────────────')
  return { pass, fail, results }
}

// ---- CLI 入口 --------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Dolphin 主动巡检控制器（dolphin-patrol.js）

用法：
  node dolphin-patrol.js                             自检（无需真实主机）
  node dolphin-patrol.js --local <目录>              本地真实扫描（需本机 semgrep）
  node dolphin-patrol.js --patrol <alias> <远程目录>  远程巡逻（需先建主机）

远程巡逻前置：先在主机库登记目标（见 dolphin-ssh-core 的 HostStore.create）。
远端无 semgrep 时自动按隔离策略部署（pipx → 临时 venv → 便携包上传），
全程不使用 sudo / --break-system-packages，临时目录扫描后自动清理。
便携包缓存：DOLPHIN_SEMGREP_CACHE（默认 ~/.dolphin/semgrep-wheel-cache）。
输出：D:\\Dolphin\\reports\\patrol-<host>-<时间戳>.json
`)
    return
  }

  if (args.includes('--local')) {
    const idx = args.indexOf('--local')
    const targetDir = args[idx + 1]
    if (!targetDir) { console.log('用法：node dolphin-patrol.js --local <目录>'); return }
    console.log(`[Dolphin] 本地扫描：${targetDir}（规则集 ${DEFAULT_RULES}）\n`)
    const r = await runLocalScan(targetDir)
    if (!r.ok) { console.log(`[Dolphin] 扫描未完成：${r.error}`); process.exitCode = 1; return }
    console.log(`[Dolphin] 扫描完成：共 ${r.total} 处（ERROR ${r.summary.ERROR} / WARNING ${r.summary.WARNING} / INFO ${r.summary.INFO}）`)
    console.log(`[Dolphin] 报告：${r.reportFile}`)
    return
  }

  if (args.includes('--patrol')) {
    const idx = args.indexOf('--patrol')
    const alias = args[idx + 1]
    const targetDir = args[idx + 2]
    if (!alias || !targetDir) { console.log('用法：node dolphin-patrol.js --patrol <alias> <远程目录>'); return }
    console.log(`[Dolphin] 远程巡逻：${alias}:${targetDir}\n`)
    const r = await runPatrol(alias, targetDir)
    if (!r.ok) { console.log(`[Dolphin] 巡逻未完成（${r.stage}）：${r.error}`); process.exitCode = 1; return }
    console.log(`[Dolphin] 巡逻完成：共 ${r.total} 处（ERROR ${r.summary.ERROR} / WARNING ${r.summary.WARNING} / INFO ${r.summary.INFO}）`)
    console.log(`[Dolphin] 报告：${r.reportFile}`)
    return
  }

  // 默认：自检
  await test()
}

// 仅当直接运行（node dolphin-patrol.js）时执行 main，被 import 时不执行。
// 注意 process.argv[1] 在 `node -e` / `--input-type=module` 场景下是 undefined，
// pathToFileURL(undefined) 会抛 TypeError，故先做守卫。
const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  await main()
}
