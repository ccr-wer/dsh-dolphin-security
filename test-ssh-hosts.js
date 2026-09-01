// ============================================================================
// test-ssh-hosts.js —— Dolphin 测试主机库（建立 + 远程巡逻链路验证）
// ----------------------------------------------------------------------------
// 用途：往主机库注入一台**测试占位主机**（alias=test01），然后触发
//       dolphin-patrol.js --patrol，验证「健康检查」阶段是否按预期失败并
//       输出清晰可诊断的日志。
//
// ⚠️ 重要声明（务必阅读）
// ----------------------------------------------------------------------------
// 本文件注入的 test01 是**纯测试占位配置**，不是真实主机：
//   alias = 'test01'
//   host   = '127.0.0.1'   （本机回环，通常没有 SSH 服务）
//   port   = 22
//   user   = 'testuser'                              ← 占位用户名
//   auth   = { kind:'password', password:'TEST-PLACEHOLDER-NotARealCredential' }
//                                                    ← 占位口令，不是真凭据
// 因此它**预期连不上**。本脚本的价值恰恰在于：验证连接失败时，runPatrol 能否
// 在 healthcheck 阶段明确停下来，而不是含糊地卡死或抛出不可读的堆栈。
//
// 数据落盘位置：DOLPHIN_HOME 沙箱目录（默认 os.tmpdir()/dolphin-test-home）。
// 绝不写入你真实的 ~/.dolphin/dolphin-ssh-hosts.json，避免污染生产主机库。
//
// ── 需要真实连接时，请提供真实配置 ──────────────────────────────────────────
// 把 TEST_HOST 换成真实主机即可（三种认证任选其一）：
//
//   1) 口令认证：
//      { alias:'prod-web-01', host:'10.0.0.11', port:22, user:'ops',
//        auth:{ kind:'password', password:'<你的口令>' } }
//
//   2) 密钥认证（推荐）：
//      { alias:'prod-web-01', host:'10.0.0.11', port:22, user:'ops',
//        auth:{ kind:'key', keyPath:'~/.ssh/id_ed25519', passphrase:'<可选>' } }
//
//   3) SSH agent 转发：
//      { alias:'prod-web-01', host:'10.0.0.11', port:22, user:'ops',
//        auth:{ kind:'agent' } }   // agentPath 省略时自动读 $SSH_AUTH_SOCK
//
// 必填字段（少一个就会抛错）：alias / host / user / auth；port 可省（默认 22）。
// 登记后执行：node dolphin-patrol.js --patrol prod-web-01 /var/www/app
// ============================================================================

import { createHostStore, createSshEngine, isSsh2Available } from './dolphin-ssh-core.js'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- 沙箱数据目录 ----------------------------------------------------------
// resolveDolphinHome() 是「运行时」读 process.env，所以这里设好之后：
//   1) 本进程 createHostStore() 落到沙箱；
//   2) spawn 出去的 dolphin-patrol.js 子进程继承 env，也落到同一个沙箱。
// 两边因此看到同一份主机库——这是本脚本能验证 --patrol 的前提。
export const TEST_HOME_DIR = process.env.DOLPHIN_HOME ?? join(tmpdir(), 'dolphin-test-home')
process.env.DOLPHIN_HOME = TEST_HOME_DIR

// ---- 测试占位主机配置 ------------------------------------------------------
export const TEST_HOST = {
  alias: 'test01',
  host: '127.0.0.1',
  port: 22,
  user: 'testuser',
  auth: { kind: 'password', password: 'TEST-PLACEHOLDER-NotARealCredential' },
  tags: ['test', 'placeholder'],
  environment: 'test',
  description: '测试占位主机（预期不可连接）——用于验证 runPatrol 健康检查链路',
}

/**
 * 注入测试主机（幂等：已存在则更新为最新配置）。
 * @param {import('./dolphin-ssh-core.js').HostStore} [store]
 * @returns {{ store: object, entry: object, created: boolean }}
 */
export function setupTestHost(store = createHostStore()) {
  const existing = store.find(TEST_HOST.alias)
  const entry = existing === undefined
    ? store.create(TEST_HOST)
    : store.update(TEST_HOST.alias, TEST_HOST)
  return { store, entry, created: existing === undefined }
}

// ---- ssh2 解析辅助 ---------------------------------------------------------
// ssh2 装在隔离工作区，D:\Dolphin 没有 node_modules。ESM 不认 NODE_PATH，
// 但 dolphin-ssh-core.js 内部用 createRequire 加载 ssh2 时认。
// 这里纯粹是本机的便利兜底，不是生产逻辑：找不到就明确提示，绝不静默。
const SSH2_CANDIDATES = [
  process.env.NODE_PATH,
  'C:/Users/imf/.workbuddy/binaries/node/workspace/node_modules',
].filter(Boolean)

function resolveNodePath() {
  if (isSsh2Available()) return process.env.NODE_PATH
  for (const dir of SSH2_CANDIDATES) {
    if (existsSync(join(dir, 'ssh2', 'package.json'))) return dir
  }
  return undefined
}

// ---- 子进程执行 ------------------------------------------------------------
function runChild(args) {
  const nodePath = resolveNodePath()
  const env = { ...process.env }
  if (nodePath !== undefined) env.NODE_PATH = nodePath

  return new Promise((res) => {
    const child = spawn(process.execPath, args, { cwd: __dirname, env })
    let output = ''
    child.stdout.on('data', (d) => { const s = d.toString(); output += s; process.stdout.write(s) })
    child.stderr.on('data', (d) => { const s = d.toString(); output += s; process.stderr.write(s) })
    child.on('close', (code) => res({ code, output }))
  })
}

// ============================================================================
// --live 模式：内联一个真实 ssh2 服务端，验证巡逻的「成功路径」
// ----------------------------------------------------------------------------
// 默认模式只能证明"连不上时会清晰报错"。--live 在本机回环起一个真实 ssh2 服务
// （随机端口、password 认证），临时把 test01 指向它，从而验证完整闭环：
//   健康检查 → 探测 semgrep → 执行扫描 → exitCode=1 仍解析 → 映射 → 存档
// 其中 exitCode=1 是关键：semgrep 语义为「1=发现漏洞」，此时 stdout 仍是完整
// JSON，runPatrol 必须按 exitCode 而非 success 判断，否则会误报扫描失败。
// 跑完自动把 test01 恢复成占位配置，沙箱库不留真实可连的残留。
// ============================================================================

// 模拟远端 semgrep --json 的输出结构（字段与真实 semgrep 保持一致）
const FAKE_SCAN_JSON = {
  results: [
    {
      check_id: 'python.lang.security.audit.sql-injection.sql-injection',
      path: 'app/db.py',
      start: { line: 30, col: 9 },
      end: { line: 30, col: 45 },
      extra: {
        severity: 'ERROR',
        message: 'Detected SQL statement that is tainted by user input.',
        metadata: { category: 'security', cwe: ['CWE-89'] },
        lines: 'cur.execute("SELECT * FROM users WHERE id=" + uid)',
      },
    },
    {
      check_id: 'javascript.lang.security.audit.child-process-injection',
      path: 'server.js',
      start: { line: 12, col: 3 },
      end: { line: 12, col: 40 },
      extra: {
        severity: 'WARNING',
        message: 'Detected user input flowing into child_process.',
        metadata: { category: 'security', cwe: ['CWE-78'] },
        lines: "exec('ping -n 4 ' + host)",
      },
    },
  ],
  errors: [],
  paths: { scanned: ['app/db.py', 'server.js'] },
}

function startFakeSshServer({ password }) {
  const require = createRequire(import.meta.url)
  const { Server, utils } = require('ssh2')
  const hostKey = utils.generateKeyPairSync('ed25519')

  const server = new Server({ hostKeys: [hostKey.private] }, (client) => {
    client.on('authentication', (ctx) => {
      // user 不做校验：这是本机回环的临时测试服务端
      if (ctx.method === 'password' && ctx.password === password) return ctx.accept()
      ctx.reject()
    })
    client.on('ready', () => {
      client.on('session', (acceptSession) => {
        const session = acceptSession()
        session.on('exec', (acceptExec, _rejectExec, info) => {
          const stream = acceptExec()
          const command = info.command
          // 顺序敏感：探测命令里同样含 "semgrep" 字样，必须优先匹配
          if (command.includes('command -v semgrep')) {
            stream.write('HAS')
            stream.exit(0)
            stream.end()
          } else if (command.startsWith('semgrep scan')) {
            stream.write(JSON.stringify(FAKE_SCAN_JSON))
            stream.exit(1) // semgrep 语义：1=发现漏洞，stdout 仍是完整 JSON
            stream.end()
          } else if (command.trim() === 'echo ok') {
            stream.write('ok\n')
            stream.exit(0)
            stream.end()
          } else {
            stream.stderr.write('unsupported command: ' + command + '\n')
            stream.exit(127)
            stream.end()
          }
        })
      })
    })
    client.on('error', () => { /* 测试服务端忽略连接级错误 */ })
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

async function runLiveMode() {
  const line = (c = '─') => console.log(c.repeat(74))
  if (!isSsh2Available() && resolveNodePath() === undefined) {
    console.log('[--live] ✗ 未找到 ssh2，无法启动本地服务端。')
    console.log('         请先安装 ssh2 或设置 NODE_PATH 指向含 ssh2 的 node_modules。')
    process.exitCode = 1
    return
  }

  console.log('\n【--live】启动本地 ssh2 服务端，验证巡逻成功路径（完整闭环）\n')
  line()
  const { server, port } = await startFakeSshServer({ password: 'live-pass' })
  console.log(`  服务端已监听 127.0.0.1:${port}`)

  const store = createHostStore()
  // 临时把 test01 指向本地服务端（跑完恢复）
  store.update('test01', {
    host: '127.0.0.1',
    port,
    user: 'liveuser',
    auth: { kind: 'password', password: 'live-pass' },
    description: '【临时】--live 模式指向本地 ssh2 测试服务端',
  })
  console.log(`  test01 已临时指向 127.0.0.1:${port}（跑完自动恢复为占位配置）`)
  line()

  console.log('\n  执行：node dolphin-patrol.js --patrol test01 /tmp/test\n')
  const { code, output } = await runChild(['dolphin-patrol.js', '--patrol', 'test01', '/tmp/test'])
  line()

  console.log('\n【--live】闭环验证')
  line()
  const checks = []
  const check = (name, cond, detail) => {
    checks.push({ name, pass: !!cond })
    console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? `  →  ${detail}` : ''}`)
  }

  const totalMatch = output.match(/巡逻完成：共 (\d+) 处/)
  const reportMatch = output.match(/报告：(.+)/)

  check('巡逻成功完成（未停在 healthcheck）', output.includes('巡逻完成'), totalMatch?.[0] ?? '')
  check('semgrep 退出码 1 被正确解析为「有漏洞」而非失败',
    totalMatch !== null && Number(totalMatch[1]) === 2,
    `解析出 ${totalMatch?.[1] ?? 0} 处（预期 2：ERROR 1 / WARNING 1）`)
  check('报告已生成并存档', reportMatch !== null, reportMatch?.[1]?.trim() ?? '(未找到报告路径)')
  check('子进程正常退出', code === 0, `exitCode=${code}`)

  // 读取报告，验证 SecurityFinding 映射与 host 维度
  if (reportMatch !== null) {
    const reportPath = reportMatch[1].trim()
    try {
      const report = JSON.parse(readFileSync(reportPath, 'utf8'))
      const f = report.findings?.[0] ?? {}
      console.log('\n  ── 报告内容抽查 ──')
      console.log(`     host=${report.host}  targetDir=${report.targetDir}  total=${report.total}`)
      console.log(`     summary=${JSON.stringify(report.summary)}`)
      console.log(`     finding[0]: ${f.file}:${f.line}:${f.col} [${f.severity}] ${f.checkId}`)
      check('findings 含 host 维度', report.findings?.every((x) => x.host === 'test01') === true)
      check('SecurityFinding 字段完整',
        !!(f.file && typeof f.line === 'number' && f.severity && f.checkId && f.message),
        `${f.severity} / ${f.checkId}`)
      check('按严重度排序（ERROR 在前）', report.findings?.[0]?.severity === 'ERROR')
    } catch (e) {
      check('报告可解析', false, e instanceof Error ? e.message : String(e))
    }
  }

  // 恢复占位配置 + 关服务端
  store.update('test01', TEST_HOST)
  await new Promise((r) => server.close(r))
  console.log(`\n  已恢复 test01 为占位配置（${TEST_HOST.host}:${TEST_HOST.port}），服务端已关闭`)

  const pass = checks.filter((c) => c.pass).length
  const fail = checks.length - pass
  line()
  console.log(`\n--live 验证结束：${pass} 通过 / ${fail} 失败`)
  line()
  if (fail > 0) process.exitCode = 1
}

// ---- 主流程 ----------------------------------------------------------------
async function main() {
  const line = (c = '─') => console.log(c.repeat(74))
  const args = process.argv.slice(2)

  // --live：起本地 ssh2 服务端验证成功路径（详见 runLiveMode 注释）
  if (args.includes('--live')) {
    await runLiveMode()
    return
  }

  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║  Dolphin 测试主机库 —— 建立 test01 并验证远程巡逻链路                 ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')
  console.log('\n⚠️  声明：test01 为测试占位配置（127.0.0.1:22 + 占位口令），预期连不上。')
  console.log('   本脚本用于验证「连接失败时健康检查阶段能否清晰报错」，不产生真实连接。\n')

  // ---- 步骤 1：建库并注入 ------------------------------------------------
  console.log('【步骤 1】建立主机库并注入 test01')
  line()
  const store = createHostStore()
  console.log(`  主机库路径：${store.path}`)
  console.log(`  （沙箱目录：${TEST_HOME_DIR} —— 不写入 ~/.dolphin，不污染生产库）`)

  const { entry, created } = setupTestHost(store)
  console.log(`  ${created ? '新建' : '更新'}主机：${entry.alias} → ${entry.user}@${entry.host}:${entry.port}`)

  // 脱敏投影验证：summarize 永不外泄 password / 私钥内容
  const engine = createSshEngine(store)
  const view = engine.find('test01')
  const leaked = JSON.stringify(view).includes('TEST-PLACEHOLDER')
  console.log(`  脱敏投影：auth=${view.auth}  password 外泄=${leaked ? '是（严重）' : '否 ✓'}`)
  console.log(`  库内主机数：${store.list().length}`)
  line()

  // ---- 步骤 2：触发远程巡逻（子进程）-------------------------------------
  console.log('\n【步骤 2】执行：node dolphin-patrol.js --patrol test01 /tmp/test')
  line()
  const nodePath = resolveNodePath()
  if (!isSsh2Available() && nodePath !== undefined) {
    console.log(`  [环境] ssh2 未在默认路径解析，已为子进程注入 NODE_PATH=${nodePath}\n`)
  }
  if (!isSsh2Available() && nodePath === undefined) {
    console.log('  [环境] ⚠ 未找到 ssh2，健康检查将报「ssh2 未安装」——这仍是一条清晰的失败路径\n')
  }

  const started = Date.now()
  const { code, output } = await runChild(['dolphin-patrol.js', '--patrol', 'test01', '/tmp/test'])
  const elapsed = Date.now() - started
  line()

  // ---- 步骤 3：断言「健康检查」阶段 --------------------------------------
  console.log('\n【步骤 3】健康检查阶段验证')
  line()
  const checks = []
  const check = (name, cond, detail) => {
    checks.push({ name, pass: !!cond })
    console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? `  →  ${detail}` : ''}`)
  }

  // patrol CLI 失败时输出格式：[Dolphin] 巡逻未完成（<stage>）：<error>
  const stageMatch = output.match(/巡逻未完成（([^）]+)）/)

  check('runPatrol 被正确触发（子进程已执行）',
    output.includes('[Dolphin] 远程巡逻：test01:/tmp/test'),
    'CLI 已进入 --patrol 分支')

  check('失败被定位到 healthcheck 阶段',
    stageMatch?.[1] === 'healthcheck',
    `stage=${stageMatch?.[1] ?? '(未匹配到)'}`)

  check('错误原因非空且可读',
    stageMatch !== null && output.split('：').pop().trim().length > 0,
    (output.match(/巡逻未完成（healthcheck）：(.+)/)?.[1] ?? '').slice(0, 80))

  check('未抛出未捕获堆栈',
    !output.includes('at Object.<anonymous>') && !output.includes('throw er;'),
    '无原始堆栈污染输出')

  check('失败快速返回（未卡死，<30s）', elapsed < 30_000, `耗时 ${elapsed}ms`)
  check('子进程以非零码退出', code !== 0, `exitCode=${code}`)

  // 顺带用 API 直连一次，看 engine.test 的结构化返回（健康检查的本体）
  console.log('\n  ── API 层佐证：engine.test("test01") 结构化返回 ──')
  const probe = await engine.test('test01')
  console.log(`     ok=${probe.ok}  latencyMs=${probe.latencyMs}`)
  console.log(`     error=${probe.error}`)
  check('engine.test 返回结构化错误', probe.ok === false && typeof probe.error === 'string' && probe.error.length > 0, probe.error?.slice(0, 70))

  engine.dispose()

  const pass = checks.filter((c) => c.pass).length
  const fail = checks.length - pass
  line()
  console.log(`\n验证结束：${pass} 通过 / ${fail} 失败`)
  line()

  // ---- 步骤 4：真实连接引导 ----------------------------------------------
  console.log('\n【步骤 4】如何进行真实远程巡逻')
  line()
  console.log('  当前 test01 连不上是**预期结果**，说明健康检查链路工作正常。')
  console.log('  要跑通真实巡逻，请提供一台真实 SSH 主机，任选一种认证：\n')
  console.log('  A. 口令认证（改本文件 TEST_HOST，或直接建库）：')
  console.log("     store.create({ alias:'prod-web-01', host:'10.0.0.11', port:22,")
  console.log("                    user:'ops', auth:{ kind:'password', password:'<口令>' } })\n")
  console.log('  B. 密钥认证（推荐）：')
  console.log("     store.create({ alias:'prod-web-01', host:'10.0.0.11', port:22, user:'ops',")
  console.log("                    auth:{ kind:'key', keyPath:'~/.ssh/id_ed25519' } })\n")
  console.log('  C. SSH agent：')
  console.log("     store.create({ alias:'prod-web-01', host:'10.0.0.11', port:22,")
  console.log("                    user:'ops', auth:{ kind:'agent' } })\n")
  console.log('  必填字段：alias / host / user / auth（缺一抛错），port 省略则默认 22。')
  console.log('  然后执行：')
  console.log('     node dolphin-patrol.js --patrol prod-web-01 /var/www/app')
  console.log('  报告输出到：D:\\Dolphin\\reports\\patrol-<host>-<时间戳>.json\n')
  console.log('  注意：真实巡逻前，远端主机需可用 semgrep')
  console.log('        （否则 patrol 会走 upload 扫描器的 fallback 路径）。\n')

  if (fail > 0) process.exitCode = 1
}

// 仅当直接运行时执行 main；被 import 时不执行。
// process.argv[1] 在 `node -e` / --input-type=module 下是 undefined，先守卫。
const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  await main()
}
