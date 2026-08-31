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
// ============================================================================

import { createHostStore, createSshEngine } from './dolphin-ssh-core.js'
import { scanDirectory } from './dsh-code-scan/lib/scanner.js'
import { extractStructuredFindings } from './dolphin-core.js'
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'

// ---- 常量 -----------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPORTS_DIR = process.env.DOLPHIN_REPORTS_DIR ?? join(__dirname, 'reports')
const DEFAULT_RULES = 'p/security-audit'
const DEFAULT_SCAN_TIMEOUT = 120000
const DEFAULT_MAX_FINDINGS = 200
const SEVERITY_ORDER = { ERROR: 0, WARNING: 1, INFO: 2 }

// 统一入口：把上游能力一并 re-export，调用方只需 import 这一个文件。
export { createHostStore, createSshEngine } from './dolphin-ssh-core.js'
export { scanDirectory } from './dsh-code-scan/lib/scanner.js'
export { extractStructuredFindings } from './dolphin-core.js'

// ---- 小工具 ---------------------------------------------------------------
const msg = (e) => (e instanceof Error ? e.message : String(e))

function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

// POSIX shell 单引号转义：targetDir / rulesConfig 都可能来自用户输入，
// 拼进远程命令字符串前必须转义，否则空格、$()、; 会注入命令。
function shellQuote(value) {
  const s = String(value)
  if (s === '') return "''"
  // 只含安全字符（路径 / 冒号 / 等号 / @ 等）时原样返回，可读性更好
  if (/^[A-Za-z0-9_./:=@%+,-]+$/.test(s)) return s
  return "'" + s.replace(/'/g, "'\\''") + "'"
}

function sortFindings(findings) {
  return [...findings].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity] ?? 3
    const sb = SEVERITY_ORDER[b.severity] ?? 3
    if (sa !== sb) return sa - sb
    if (a.file !== b.file) return a.file < b.file ? -1 : 1
    if (a.line !== b.line) return a.line - b.line
    return (a.col ?? 0) - (b.col ?? 0)
  })
}

function summarize(findings) {
  const s = { ERROR: 0, WARNING: 0, INFO: 0 }
  for (const f of findings) s[f.severity] = (s[f.severity] ?? 0) + 1
  return s
}

// ============================================================================
// 2. buildRemoteScanCommand —— 生成远程 semgrep 扫描命令（纯函数）
// ----------------------------------------------------------------------------
// 规则集注入与本地扫描器（scanner.js 的 buildSemgrepArgs）保持同一语义：
//   有 rulesConfig → semgrep scan --config <rulesConfig> <targetDir> --json
//   无 rulesConfig → semgrep scan <targetDir> --json
// ============================================================================
export function buildRemoteScanCommand(targetDir, rulesConfig) {
  const parts = ['semgrep', 'scan']
  if (rulesConfig) parts.push('--config', shellQuote(rulesConfig))
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
    8000,
    1,
  )
  return probe.success && probe.stdout.includes('HAS')
}

// ============================================================================
// 4. buildRemoteRunnerSource —— 生成远端 fallback 执行脚本源码（纯函数）
// ----------------------------------------------------------------------------
// 远端没有 semgrep 时，把本地 dsh-code-scan 的扫描器「部署」到远端用 node 跑。
// 注意两点关键设计：
//   a) 上传时把 scanner.js 重命名为 scanner.mjs：scanner.js 是 ESM（import 语法），
//      但远端临时目录没有 package.json 的 "type":"module"，.js 会被当 CJS 解析
//      而报错；.mjs 后缀强制按 ESM 解析。
//   b) targetDir / rulesConfig 用 JSON.stringify 写死进脚本，而不是走命令行参数，
//      彻底绕开 shell 转义问题。
// 诚实边界：scanner.js 底层仍调用 semgrep 二进制（execFile('semgrep')），所以
// 这条 fallback 仅在「远端有 node 且 semgrep 可用但不一定在 PATH」时才有意义；
// 若远端完全没有 semgrep，最终仍会得到「未检测到 semgrep」的降级错误。
// ============================================================================
function buildRemoteRunnerSource(targetDir, rulesConfig) {
  return [
    "import { scanDirectory } from './scanner.mjs'",
    `const targetDir = ${JSON.stringify(targetDir)}`,
    `const rulesConfig = ${JSON.stringify(rulesConfig)}`,
    'const outcome = await scanDirectory(targetDir, { rulesConfig, raw: true })',
    'process.stdout.write(JSON.stringify({',
    '  ok: outcome.ok,',
    '  message: outcome.message ?? null,',
    '  results: outcome.rawResults ?? [],',
    '}))',
  ].join('\n')
}

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
  const engine = options.engine ?? createSshEngine(options.store ?? createHostStore())

  // 1. 连通性检查（echo ok，5s 预算）
  const check = await engine.test(alias)
  if (!check.ok) {
    return { ok: false, stage: 'healthcheck', host: alias, error: check.error }
  }

  // 2. 探测远程是否装了 semgrep
  let hasSemgrep = false
  try {
    hasSemgrep = await detectRemoteSemgrep(engine, alias)
  } catch (e) {
    return { ok: false, stage: 'detect', host: alias, error: msg(e) }
  }

  // 3. 执行远程扫描
  //    attempts 固定传 1：扫描是只读幂等操作，断线重连重放只会浪费一次完整扫描，
  //    宁可失败上报，也不静默重扫。
  let rawResults
  if (hasSemgrep) {
    const cmd = buildRemoteScanCommand(targetDir, rulesConfig)
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
  } else {
    // 远端无 semgrep：把本地扫描器 + 规则文件部署到远端临时目录，用 node 执行。
    const remoteBase = `/tmp/dolphin-patrol-${Date.now()}`
    try {
      await engine.exec(alias, `mkdir -p ${shellQuote(remoteBase)}`, 5000, 1)
      // 上传扫描器（远端重命名为 .mjs 强制 ESM，见 buildRemoteRunnerSource 注释）
      const localScanner = resolve(__dirname, 'dsh-code-scan/lib/scanner.js')
      await engine.upload(alias, localScanner, `${remoteBase}/scanner.mjs`, false)
      // 若 rulesConfig 指向一个本地规则文件，把它一并上传，远端改用该文件
      let remoteRules = rulesConfig
      if (typeof rulesConfig === 'string' && existsSync(resolve(rulesConfig))) {
        await engine.upload(alias, resolve(rulesConfig), `${remoteBase}/rules.yml`, false)
        remoteRules = `${remoteBase}/rules.yml`
      }
      // 生成 runner.mjs 上传（本地临时文件，跑完删除）
      const runnerLocal = join(tmpdir(), `dolphin-patrol-runner-${Date.now()}.mjs`)
      writeFileSync(runnerLocal, buildRemoteRunnerSource(targetDir, remoteRules), 'utf8')
      try {
        await engine.upload(alias, runnerLocal, `${remoteBase}/runner.mjs`, false)
      } finally {
        rmSync(runnerLocal, { force: true })
      }
      // 远端执行
      const rr = await engine.exec(alias, `node ${shellQuote(`${remoteBase}/runner.mjs`)}`, scanTimeoutMs, 1)
      if (rr.exitCode !== 0) {
        return { ok: false, stage: 'scan', host: alias, error: `远端扫描脚本退出码 ${rr.exitCode}：${(rr.stderr || '').slice(0, 300)}` }
      }
      let parsed
      try {
        parsed = JSON.parse(rr.stdout)
      } catch {
        return { ok: false, stage: 'parse', host: alias, error: '远端扫描脚本输出无法解析为 JSON' }
      }
      if (parsed.ok !== true) {
        // scanner.js 在远端报错（例如仍未检测到 semgrep），诚实降级回传
        return { ok: false, stage: 'scan', host: alias, error: parsed.message || '远端扫描失败' }
      }
      rawResults = parsed.results ?? []
    } catch (e) {
      return { ok: false, stage: 'deploy', host: alias, error: msg(e) }
    }
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
  // 转义正确性：`;` 与 `rm -rf` 必须落在单引号内（作为 --config 的字面参数值），
  // 而不是裸露出来被 shell 当命令分隔符/命令执行。
  check('恶意规则集被转义（; 与 rm 被单引号包裹）', c4 === "semgrep scan --config 'p/foo'\\''; rm -rf /tmp/x; #' /x --json", c4)

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

  // 5. 存档 dry-run（runLocalScan 对空目标——无网络，纯本地写文件）
  console.log('\n【5】存档 dry-run')
  const dryReports = join(tmpdir(), `dolphin-patrol-reports-${Date.now()}`)
  const emptyDir = join(tmpdir(), `dolphin-patrol-empty-${Date.now()}`)
  mkdirSync(emptyDir, { recursive: true })
  const local = await runLocalScan(emptyDir, { reportsDir: dryReports, timeoutMs: 30000 })
  check('本地扫描返回 ok', local.ok === true, local.error)
  check('存档文件已生成', existsSync(local.reportFile), local.reportFile)
  check('空目标 total=0', local.total === 0, `total=${local.total}`)
  rmSync(emptyDir, { recursive: true, force: true })
  rmSync(dryReports, { recursive: true, force: true })

  // 6. fallback runner 源码语法自检（不真实连远端）
  console.log('\n【6】fallback runner 源码')
  const src = buildRemoteRunnerSource('/var/www/app', 'p/security-audit')
  check('runner 含 scanDirectory 导入', src.includes("import { scanDirectory } from './scanner.mjs'"))
  check('runner 含 JSON 输出', src.includes('process.stdout.write(JSON.stringify'))
  check('targetDir 被写死进脚本', src.includes('"/var/www/app"'))

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
