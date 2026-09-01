# SSH 融合侦察报告 —— dsh-ssh

侦察对象：D:\Dolphin\dsh-web\packages\dsh-ssh
包标识：@linxin666/dsh-ssh v0.3.6
侦察时间：2026-08-31
侦察方式：全量源码通读（src/ 下 4,331 行，含 engine/ 与 client/ 子模块）+ npm registry 依赖核实

注意：本仓库根目录无 .gitignore，本文件落在 D:\Dolphin\ 下会被 git status 捕获。
如需保持工作区纯净，请自行加入 .gitignore 或阅后删除。

---

## 〇、结论速览（TL;DR）

| 侦察维度 | 结论 |
| --- | --- |
| 模块形态 | 纯 ESM（"type": "module"），Node ^22.19 \|\| >=24，TypeScript 源码，非编译产物未生成 |
| 接口形态 | cordis 插件契约（name / inject / Config / apply），**没有扁平的 connect / run 函数**；核心能力全在 `SshEngine` 类的实例方法上，`exec` 存在，`connect` 不存在（连接是惰性的） |
| 执行方式 | **100% 走 ssh2 库 API，零 child_process**。全 src 目录 grep `child_process\|spawn\|execSync` 无命中 |
| 必须打包的依赖 | `ssh2` + 传递依赖 `asn1`、`bcrypt-pbkdf`（→ `tweetnacl`）。Web 终端另需 `ws` + `@xterm/xterm` + `@xterm/addon-fit` |
| 最大融合坑 | ① `schemastery` 与 `@deepseek-ai/dsh-settings` 属于 **devDependencies 但被运行时 import**；② loopback 围栏不信任 `X-Forwarded-For`，反向代理后全部 403；③ 浏览器半区存在对外遥测上报 |

---

## 一、接口暴露面

### 1.1 包级导出（package.json 的 exports 字段）

| 子路径 | 产物 | 运行环境 | 说明 |
| --- | --- | --- | --- |
| `.` | `lib/index.js` | Node（宿主进程） | 插件宿主半区入口 |
| `./invariant` | `lib/invariant.js` | Node | 空实现，`apply()` 什么都不做，无断言 |
| `./client` | `lib/client.js` | 浏览器 | GUI 半区（面板 + Web 终端） |
| `./src/*` | 源码直通 | — | 便于宿主直接引用 TS 源码 |
| `./package.json` | — | — | — |

### 1.2 宿主半区入口 `src/index.ts` 的实际导出

**关键结论：这里没有 `connect`、没有 `run`，也没有 `exec`。** 它导出的是 cordis 插件生命周期契约：

```ts
export const name = 'ssh'
export const inject = ['webServer', 'tools', 'systemPrompt']
export const SSH_SETTINGS_NAMESPACE = settingsNamespace('dsh-ssh')
export interface Config { announceToAgent?: boolean; enabled?: boolean; terminalFontFamily?: string }
export const Config: z<Config> = z.object({ ... })
export const SSH_GUIDANCE = '本机已安装 dsh-ssh 插件（DSH 远程 SSH 运维）…'  // 给模型的系统提示词
export const apply = mountOnce('@linxin666/dsh-ssh', applyImpl)
```

`applyImpl(ctx, config)` 内部做了四件事，构成一个完整的挂载面：

```ts
const store = new HostStore()                        // 主机配置读写
const engine = new SshEngine(store)                  // 引擎（真正的 SSH 能力）
ctx.effect(() => () => { engine.dispose() }, 'dsh-ssh: engine')

const { routes, upgrade } = makeRoutes({ store, engine })   // HTTP 路由 + WebSocket 升级
const tools = [sshListTool(engine), sshExecTool(engine), sshUploadTool(engine),
               sshDownloadTool(engine), sshTunnelTool(engine), sshClusterTool(engine)]
// 随后 sync() 按配置开关注册：ctx.webServer.register / registerUpgrade / ctx.tools.register
// 以及可选的 ctx.systemPrompt.section({ name: 'plugin:dsh-ssh', order: 150, text: SSH_GUIDANCE })
```

### 1.3 真正的核心调用接口 —— `SshEngine`（src/engine.ts，175 行）

这才是你要找的东西。注意：**`connect` 方法不存在**，连接是在首次操作时由连接池惰性建立的。

| 方法 | 签名 | 备注 |
| --- | --- | --- |
| `list` | `(query?: string) => SshHostSummary[]` | 脱敏后的主机列表（不含密码/密钥） |
| `find` | `(alias: string) => SshHostSummary \| undefined` | — |
| **`exec`** | `(alias, command, timeoutMs?) => Promise<ExecResult>` | **核心**。`ExecResult = { success, exitCode, timedOut, stdout, stderr, durationMs, error? }` |
| `cluster` | `({ command, aliases?, environment?, tags?, timeoutMs?, maxWorkers? }) => Promise<ClusterResult[]>` | 批量并发执行，默认并发 8。**这就是"run"的批量形态** |
| `openShell` | `(alias, { cols, rows }, onKeyboardInteractive?) => Promise<ShellSession>` | PTY 终端，独占一条连接 |
| `upload` | `(alias, localPath, remotePath, recursive, onProgress?) => Promise<{bytes, files}>` | SFTP，支持目录递归 |
| `download` | `(alias, remotePath, localPath, onProgress?) => Promise<{bytes}>` | 单文件，不支持目录 |
| `ls` | `(alias, path) => Promise<RemoteDirEntry[]>` | 远程目录浏览 |
| `startTunnel` | `(alias, { remotePort, remoteHost?, localPort? }) => Promise<TunnelInfo>` | 本地端口转发，仅监听 127.0.0.1 |
| `listTunnels` / `stopTunnel` / `stopAllTunnels` | — | 隧道管理 |
| `dropAlias` | `(alias) => void` | 断开该别名的连接与隧道（改配置/删主机时必须调用） |
| `test` | `(alias) => Promise<TestResult>` | 内部就是 `exec(alias, 'echo ok', 10_000)` 测延迟 |
| `dispose` | `() => void` | 关闭全部连接与隧道 |

### 1.4 底层可直连的函数级接口（脱离 cordis 时最有用）

| 模块 | 导出的关键函数 |
| --- | --- |
| `engine/connection-pool.ts` | `DEFAULTS`、`buildConnectConfig`、`resolveAgentPath`、`connectClient`、`connectChain`、`acquire`、`disposeRecord`、`endRecordChain`、`sweepPool`、`withClient`、`execCommand`、`appendOutput` |
| `engine/sftp.ts` | `walkLocalDir`、`upload`、`download`、`ls` |
| `engine/tunnel.ts` | `startTunnel`、`listTunnels`、`stopTunnel`、`stopAllTunnels` |
| `engine/cluster.ts` | `cluster` |
| `engine/pty.ts` | `openShell` |
| `store.ts` | `HostStore`、`storePath`、`sshConfigPath`、`validateHostPayload`、`validateAlias`、`normalizeAgentPath`、`expandHome` |
| `protocol.ts` | 全部类型 + `SSH_API_BASE`、`SSH_API` 路由常量表 |

### 1.5 Agent 工具面（tools.ts，371 行）

六个工具，通过 `defineTool` 注册，GUI 与 Agent 共享同一份主机配置：
`ssh_list` / `ssh_exec` / `ssh_upload` / `ssh_download` / `ssh_tunnel` / `ssh_cluster`

### 1.6 HTTP 路由面（protocol.ts 中 SSH_API 常量，routes.ts 实现）

```
GET|POST|PATCH|DELETE  /api/dsh-ssh/hosts                    主机 CRUD
POST                   /api/dsh-ssh/hosts/import-ssh-config  从 ~/.ssh/config 导入
POST                   /api/dsh-ssh/test                     连通性探测
POST                   /api/dsh-ssh/exec                     执行远程命令
POST                   /api/dsh-ssh/cluster                  集群执行
POST                   /api/dsh-ssh/upload                   上传（NDJSON 进度流）
POST                   /api/dsh-ssh/download                 下载
POST                   /api/dsh-ssh/ls                       远程目录列举
POST                   /api/dsh-ssh/tunnel                   隧道管理
GET  (WebSocket 升级)   /api/dsh-ssh/terminal                 PTY 终端
```

---

## 二、依赖检查

### 2.1 模块格式：纯 ESM

```json
"type": "module",
"engines": { "node": "^22.19.0 || >=24.0.0" },
"main": "lib/index.js",
"types": "lib/types/index.d.ts"
```

- 构建链：`tsc -p tsconfig.build.json`（产出 `lib/types/*.d.ts`）→ `tsdown`（产出 `lib/*.js`）
- 源码内部 import 带 `.ts` 后缀（`from './engine.ts'`），依赖 TS 5.7 + `allowImportingTsExtensions`，**不能直接用 ts-node/tsx 之外的裸 Node 跑 src**
- 当前状态：`node_modules` 不存在、`lib/` 不存在，属纯源码未构建状态

### 2.2 第三方依赖清单与打包必要性

**生产依赖（dependencies，4 个）**

| 包 | 版本 | 用途 | 融合时是否必须 |
| --- | --- | --- | --- |
| `ssh2` | ^1.17.0 | SSH 协议核心（exec / shell / sftp / forwardOut） | **必须** |
| `ws` | ^8.18.0 | Web 终端的 WebSocket Server | 仅 Web 终端需要，纯 exec 可裁 |
| `@xterm/xterm` | ^6.0.0 | 浏览器终端 UI | 仅浏览器半区需要 |
| `@xterm/addon-fit` | ^0.11.0 | 终端尺寸自适应 | 仅浏览器半区需要 |

**peerDependencies**：`react` ^18.2.0、`react-dom` ^18.2.0（浏览器半区）

**ssh2 的传递依赖（已向 npm registry 核实 v1.17.0）**

```
dependencies:          asn1 ^0.2.6, bcrypt-pbkdf ^1.0.2      (bcrypt-pbkdf 再依赖 tweetnacl)
optionalDependencies:  nan ^2.23.0, cpu-features ~0.0.10      (native 加速，可跳过)
engines:               node >=10.16.0
main:                  ./lib/index.js       type: undefined → CJS
```

要点：ssh2 本身是 **CJS**，在一个 `"type": "module"` 的包里通过 ESM 默认导入使用（`import { Client } from 'ssh2'`），Node 的 CJS-ESM 互操作能处理，但打包器需保留这一路径。`cpu-features` / `nan` 是可选 native 依赖，构建失败时 ssh2 会回退到纯 JS 实现——离线打包时可以直接去掉。

### 2.3 ⚠️ 依赖声明缺陷（融合时的头号风险）

`src/index.ts` 顶部有两处**运行时** import，但对应包被声明在 `devDependencies`：

```ts
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'  // 运行时
import z from 'schemastery'                                                              // 运行时
```

而 `dependencies` 里只有 `ssh2` / `ws` / `@xterm/*` 四个。

| 被运行时 import 的包 | 声明位置 | 融合处理 |
| --- | --- | --- |
| `schemastery`（^3.18.0） | devDependencies | **必须补进 dependencies**，否则宿主不提供就启动失败 |
| `@deepseek-ai/dsh-settings` | devDependencies | 要么补进依赖，要么把 `installSettingsSection` 这条路径整体裁掉 |
| `@deepseek-ai/dsh-tools` | devDependencies | `defineTool` 是运行时依赖，同上 |

其余 `@deepseek-ai/*`（cordis / dsh-host-webserver / dsh-system-prompt / dsh-llm / dsh-client-*）多为 `import type` 或 `import type {}`，**编译后会被完全擦除**，不产生运行时依赖。这条可以放心。

### 2.4 Node 内置模块占用面

`node:fs` `node:os` `node:path` `node:path/posix` `node:http` `node:net` `node:crypto`（`randomBytes`，用于上传暂存文件名）。

**没有 `node:child_process`。**

---

## 三、参数细节

### 3.1 建立连接的必需参数

`buildConnectConfig(entry, sock, opts)`（connection-pool.ts:65）是唯一的建连参数构造点：

```ts
const config: ConnectConfig = {
  host: entry.host,                              // 必需
  port: entry.port,                              // 必需，默认 22
  username: entry.user,                          // 必需
  readyTimeout: opts.connectTimeoutMs,           // 默认 15_000
  keepaliveInterval: opts.keepaliveIntervalMs,   // 默认 15_000
  keepaliveCountMax: 3,
  tryKeyboard: true,
}
if (sock !== undefined) config.sock = sock       // ProxyJump 时注入上一跳的 stream
```

认证三选一，由 `entry.auth.kind` 决定：

| kind | 写入 ssh2 的字段 | 约束 |
| --- | --- | --- |
| `'password'` | `config.password = entry.auth.password` | 明文存储在 `~/.dsh/dsh-ssh.json` |
| `'key'` | `config.privateKey = readFileSync(keyPath, 'utf8')`<br>`config.passphrase = entry.auth.passphrase`（可选） | `keyPath` 必需且文件必须存在，否则抛 `private key not found` |
| `'agent'` | `config.agent = agentPath` | 解析顺序：显式配置 → `$SSH_AUTH_SOCK` → win32 回退 `'pageant'` → 抛错 |

注意：私钥是**读文件内容**传给 ssh2 的，不是传路径。`expandHome()` 会展开 `~` 和 `~/`。

**引擎级默认值（DEFAULTS）**

```
idleTimeoutMs:        30 分钟   // 空闲自动断开
connectTimeoutMs:     15 秒
keepaliveIntervalMs:  15 秒
maxOutputBytes:       2 MB      // stdout / stderr 各自独立计算
defaultExecTimeoutMs: 60 秒
defaultMaxWorkers:    8         // 集群并发
sftpConcurrency:      8
```

**完整的 SshHostEntry 结构（protocol.ts）**

```ts
{
  alias: string                    // 稳定标识，所有操作都靠它，正则 ^[a-zA-Z0-9][a-zA-Z0-9._-]*$
  host: string                     // 主机名或 IP
  port: number                     // 默认 22，范围 1..65535
  user: string                     // 登录用户
  auth: {
    kind: 'key' | 'password' | 'agent'
    keyPath?: string               // kind==='key' 时必需
    passphrase?: string
    password?: string
    agentPath?: string             // socket 路径 | 'pageant' | undefined(自动探测)
  }
  proxyJump: string[]              // 跳板机别名链（必须是本插件已配置的别名）
  description?: string
  environment?: string             // 用于 cluster 过滤
  tags: string[]                   // 用于 cluster 过滤（ALL 语义）
  location?: string
  createdAt: number
  updatedAt: number
}
```

### 3.2 执行远程命令走的是哪条路？—— **ssh2 API，不是 child_process**

这是本次侦察最明确的结论之一。对 `src/` 全目录 grep `child_process|spawn|execSync` **零命中**。所有远端操作都是 ssh2 的原生能力：

| 能力 | ssh2 API | 位置 |
| --- | --- | --- |
| 执行远程命令 | `client.exec(command, (err, stream) => …)` | connection-pool.ts:324 |
| 交互式终端 | `client.shell({ term: 'xterm-256color', cols, rows })` | pty.ts:42 |
| 文件传输 | `client.sftp()` → `sftp.fastPut` / `sftp.fastGet` / `sftp.readdir` | sftp.ts |
| 端口转发 | `client.forwardOut('127.0.0.1', 0, remoteHost, remotePort)` + `node:net` 的 `createServer('127.0.0.1')` | tunnel.ts |
| 跳板机 | 逐跳 `hopClient.forwardOut(...)` 拿到 stream，作为下一跳的 `config.sock` | connection-pool.ts:198 |

grep 中出现的 `exec(` 全部是 dsh-ssh 自己的方法名或正则 `.exec()`，与系统命令执行无关。

**exec 的完整语义（值得注意的实现细节）**

- `stdout` 与 `stderr` **分离采集**：`stream.on('data')` 与 `stream.stderr.on('data')`
- 超时是硬截止：到点发 `stream.signal('KILL')` + `stream.close()`，并立即 resolve（`timedOut: true`），不等对端确认
- 输出截断保护：单流 2 MB，截断时追加 `…[output truncated]`，并且**不会切断 UTF-16 代理对**（`/[\uD800-\uDBFF]$/` 检查）
- 通道关闭但无退出码（连接中途断掉）时 reject，交给上层重连重试

### 3.3 连接池与重试语义

```
withClient(engine, alias, fn, attempts = 3)
```

- 连接按 alias 池化在 `engine.pool: Map<string, PoolRecord>`
- `acquireQueue` 保证同一 alias 的并发 acquire 只建一条连接
- `PoolRecord` 带 `pinned`（隧道占用，永不被清扫）和 `inFlight`（清扫保护）计数
- 后台定时器每 `max(10s, idleTimeoutMs/4)` 清扫空闲连接
- **重试只在连接确实断掉时发生**（`record.broken` 为真才重连重放）；健康连接上的失败直接抛出，不重放

---

## 四、融合注意点

### 4.1 DSH 专属上下文耦合

你提到的「`ctx` 或 `exec.agent`」——这里**没有 `exec.agent` 这种东西**，耦合的是 **cordis 的 `Context`**。需要澄清：`exec` 在本包里只有两层含义：`SshEngine.exec()`（执行远程命令）和 `client.exec()`（ssh2 的命令通道），都与 agent 无关。

`applyImpl` 对 ctx 的依赖清单：

| ctx 能力 | 用途 | 可否裁掉 |
| --- | --- | --- |
| `ctx.effect(fn, label)` | 生命周期与资源回收 | 可（自己管理 dispose） |
| `ctx.webServer.register / registerUpgrade` | HTTP 路由 + WebSocket | 可以，只要不用 GUI |
| `ctx.tools.register` | 注册 6 个 Agent 工具 | 可以 |
| `ctx.systemPrompt.section` | 向模型宣告插件 | 可以，默认 `announceToAgent: false` |
| `installSettingsSection(ctx, …)` | 设置面板 | 可以，但它来自缺失的 devDep |

`inject = ['webServer', 'tools', 'systemPrompt']` 是硬性前置声明，cordis 会等服务就绪再调用 apply。

**好消息**：`SshEngine` 和 `HostStore` 本身**完全不依赖 cordis**（store.ts 里明确写着 "Pure file I/O — no cordis dependency, unit-testable"）。engine 各模块只依赖一个结构化的 `PoolEngine` 接口：

```ts
export interface PoolEngine {
  readonly store: HostStore
  readonly opts: Required<EngineOptions>
  readonly pool: Map<string, PoolRecord>
  readonly acquireQueue: Map<string, Promise<PoolRecord>>
}
```

也就是说：**只要造一个 `HostStore`，再 new 一个 `SshEngine`，就能脱离 DSH 独立使用**，不需要 cordis、不需要 Web 服务器。这是最省力的融合路径。

### 4.2 权限与网络限制（融合时最容易踩的坑）

**① Loopback 信任围栏 —— 最大坑**

所有 `/api/dsh-ssh/*` 路由都过 `isLoopbackRequest(req)`（loopback.ts），不通过直接 403：

```ts
export function isLoopbackRequest(request: IncomingMessage): boolean {
  if (!isLoopbackAddress(request.socket.remoteAddress)) return false   // 127/8、::1、::ffff:127/8
  const host = request.headers.host
  if (typeof host !== 'string') return false
  const hostUrl = new URL('http://' + host)
  if (!isLoopbackHostname(hostUrl.hostname)) return false              // localhost / [::1] / 127.x
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  return new URL(origin).host === hostUrl.host                          // Origin 必须与 Host 同
}
```

要点：
- **socket 地址是权威依据，`X-Forwarded-For` 永不信任**。任何反向代理（Nginx / Caddy / frp）后面部署，remoteAddress 变成代理地址，全部请求 403。
- 三重要素：socket 回环 + Host 头回环 + 浏览器同源标记（sec-fetch-site / Origin）
- 融合到 Dolphin 时如果要走代理，必须改这段（或前置一层把真实地址透传）

**② 其他权限/网络面**

| 项 | 约束 | 影响 |
| --- | --- | --- |
| 隧道监听 | `server.listen(localPort ?? 0, '127.0.0.1')` 硬编码 | 外部机器访问不到转发的端口 |
| 上传暂存 | `os.tmpdir()/dsh-ssh-uploads/`，目录 0700，暂存文件 0600，上限 **4 GiB** | 磁盘占用；多用户机器上权限隔离 |
| 主机配置 | `$DSH_HOME/dsh-ssh.json`（默认 `~/.dsh`），目录 0700、文件 0600、tmp+rename 原子写 | **密码/密钥口令明文存储** |
| 本地文件读写 | `ssh_upload` / `ssh_download` 以宿主进程权限直读直写**本机任意路径**，不经 bash 沙箱 | 权限面很大，等同宿主用户权限 |
| 出站网络 | 到远程主机的 22 端口；跳板机逐跳串联 | 需放通出站 22 |
| 输出脱敏 | exec / cluster 输出**原样返回**，仅做 2 MB 截断 | `env` 之类命令会把远端密钥带回对话记录 |
| 命令重放 | 断线自动重连最多 3 次 | **非幂等命令可能被重复执行** |
| 远端路径 | 上传的 `remotePath` 必须是绝对路径，相对路径直接拒绝 | — |
| 目录下载 | 不支持，只能逐文件下载（上传支持递归） | — |
| JSON body | `readJsonBody` 默认上限 64 KiB | 大 payload 会被静默置 null |

**③ 单实例守卫**

`apply = mountOnce('@linxin666/dsh-ssh', applyImpl)` 用 `globalThis[Symbol.for('dsh-web.mounted-plugins')]` 做全局去重。同一进程内第二次 apply 是**静默 no-op**，不报错。融合时如果 Dolphin 也跑多实例，注意这个行为。

**④ 对外遥测（融合时应移除）**

浏览器半区每次挂载会调用 `reportDailyHeartbeat([{ name: '@linxin666/dsh-ssh' }])`：

```
POST https://dsh-market.com/api/telemetry/event
body: { kind: 'heartbeat', visitor: <localStorage 中的随机 UUID>, items: [{ name, version? }] }
```

- 每浏览器每 UTC 日一次，`navigator.webdriver` 为真时跳过
- 失败静默，不影响 UI
- **这是本包唯一一处主动对外网发起的请求**。融合进 Dolphin 时，如果不想有外部回连，直接删掉 `client/index.ts:79` 那一行即可（函数本身在 telemetry.ts 里是独立的，无副作用耦合）

---

## 五、可复用的核心代码片段

以下片段均从源码提炼，可在 Dolphin 中直接使用（去掉 cordis 依赖后的最小路径）。

### 5.1 最小融合骨架（脱离 cordis，仅 exec）

```ts
import { SshEngine } from './engine.ts'
import { HostStore } from './store.ts'

const store = new HostStore()          // 可传自定义路径：new HostStore('D:/dolphin/ssh-hosts.json')
const engine = new SshEngine(store)

// 添加一台主机（密码认证）
store.create({
  alias: 'web01',
  host: '192.168.1.10',
  port: 22,
  user: 'root',
  auth: { kind: 'password', password: 'xxx' },
})

// 添加一台主机（密钥认证，支持 ~ 展开与 passphrase）
store.create({
  alias: 'web02',
  host: '10.0.0.2',
  user: 'deploy',
  auth: { kind: 'key', keyPath: '~/.ssh/id_ed25519', passphrase: undefined },
})

// 执行远程命令
const result = await engine.exec('web01', 'uptime', 10_000)
console.log(result.exitCode, result.stdout, result.stderr, result.durationMs)

// 集群执行
const results = await engine.cluster({ command: 'df -h', tags: ['prod'], maxWorkers: 8 })

// 务必在退出时释放
engine.dispose()
```

### 5.2 建连参数构造（buildConnectConfig，connection-pool.ts:65）

```ts
import { existsSync, readFileSync } from 'node:fs'
import type { ConnectConfig } from 'ssh2'

export function buildConnectConfig(entry, sock, opts): ConnectConfig {
  const config: ConnectConfig = {
    host: entry.host,
    port: entry.port,
    username: entry.user,
    readyTimeout: opts.connectTimeoutMs,        // 15_000
    keepaliveInterval: opts.keepaliveIntervalMs, // 15_000
    keepaliveCountMax: 3,
    tryKeyboard: true,
  }
  if (sock !== undefined) config.sock = sock
  if (entry.auth.kind === 'password') {
    config.password = entry.auth.password
  } else if (entry.auth.kind === 'agent') {
    const agentPath = resolveAgentPath(entry.auth.agentPath)
    if (agentPath === undefined) throw new Error('ssh-agent is not available: set SSH_AUTH_SOCK …')
    config.agent = agentPath
  } else {
    const keyPath = entry.auth.keyPath === undefined ? undefined : expandHome(entry.auth.keyPath)
    if (keyPath === undefined || !existsSync(keyPath)) {
      throw new Error('private key not found: ' + (entry.auth.keyPath ?? '(unset)'))
    }
    config.privateKey = readFileSync(keyPath, 'utf8')   // 读内容，不是路径
    if (entry.auth.passphrase !== undefined && entry.auth.passphrase !== '') {
      config.passphrase = entry.auth.passphrase
    }
  }
  return config
}

export function resolveAgentPath(agentPath?: string): string | undefined {
  const explicit = normalizeAgentPath(agentPath)
  if (explicit !== undefined) return explicit
  const sock = process.env.SSH_AUTH_SOCK
  if (sock !== undefined && sock !== '') return sock
  if (process.platform === 'win32') return 'pageant'   // Windows 走 PuTTY Pageant
  return undefined
}
```

### 5.3 命令执行核心（execCommand，含超时 / 截断 / 断线判定）

```ts
export function appendOutput(target: { text: string; truncated: boolean }, chunk: Buffer, maxBytes: number): void {
  if (target.truncated) return
  if (target.text.length + chunk.length > maxBytes) {
    let cut = chunk.toString('utf8').slice(0, maxBytes - target.text.length)
    if (/[\uD800-\uDBFF]$/.test(cut)) cut = cut.slice(0, -1)   // 不切断代理对
    target.text += cut + '…[output truncated]'
    target.truncated = true
    return
  }
  target.text += chunk.toString('utf8')
}

export async function execCommand(engine, alias, command, timeoutMs?): Promise<ExecResult> {
  const started = Date.now()
  const budget = timeoutMs !== undefined && timeoutMs > 0 ? timeoutMs : engine.opts.defaultExecTimeoutMs
  return withClient(engine, alias, async (client) => {
    return await new Promise<ExecResult>((resolve, reject) => {
      client.exec(command, (error, stream) => {
        if (error !== undefined) { reject(error); return }
        const stdout = { text: '', truncated: false }
        const stderr = { text: '', truncated: false }
        let timedOut = false
        let settled = false
        const finish = (): void => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve({ success: false, exitCode: null, timedOut, stdout: stdout.text,
                    stderr: stderr.text, durationMs: Date.now() - started,
                    error: timedOut ? 'command timed out after ' + budget + ' ms' : undefined })
        }
        const timer = setTimeout(() => {
          timedOut = true
          try { stream.signal('KILL') } catch {}
          try { stream.close() } catch {}
          finish()                       // 硬截止：不等对端确认
        }, budget)
        stream.on('data', (chunk: Buffer) => appendOutput(stdout, chunk, engine.opts.maxOutputBytes))
        stream.stderr.on('data', (chunk: Buffer) => appendOutput(stderr, chunk, engine.opts.maxOutputBytes))
        stream.on('close', (code: number | null) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          if (typeof code !== 'number' && !timedOut) {
            // 没有退出码 = 连接中途断了 → reject，交给上层重连重试
            reject(new Error('ssh: connection lost mid-flight (channel closed without an exit status)'))
            return
          }
          resolve({ success: code === 0, exitCode: code, timedOut,
                    stdout: stdout.text, stderr: stderr.text, durationMs: Date.now() - started })
        })
        stream.on('error', (streamError: Error) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          reject(streamError)
        })
      })
    })
  })
}
```

### 5.4 带重试的连接借用（withClient —— 非幂等命令的注意点）

```ts
export async function withClient<T>(engine, alias, fn: (client: Client) => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let record = engine.pool.get(alias)
    if (record === undefined || record.broken) {
      if (record !== undefined) disposeRecord(engine, alias, record)
      record = await acquire(engine, alias)
    }
    record.idleAt = Date.now()
    record.inFlight += 1
    try {
      const result = await fn(record.client)
      record.idleAt = Date.now()
      return result
    } catch (error) {
      lastError = error
      // 只有连接真的断掉才重连重放；健康连接上的失败是逻辑错误，直接抛
      if (!record.broken) throw error
      disposeRecord(engine, alias, record)
    } finally {
      record.inFlight -= 1
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}
```

**融合建议**：如果 Dolphin 侧要执行有副作用的命令（部署、重启、写库），把 `attempts` 传 1，避免重放。

### 5.5 ProxyJump 跳板机链（connectChain 核心循环）

```ts
const hops: Client[] = []
let sock: ConnectConfig['sock']
for (let index = 0; index < chain.length; index += 1) {
  const hop = engine.store.find(chain[index])
  if (hop === undefined) throw new Error('proxyJump alias \'' + chain[index] + '\' not found — create it first')
  const hopClient = await connectClient(buildConnectConfig(hop, sock, engine.opts), onKeyboardInteractive)
  hops.push(hopClient)
  const next = index + 1 < chain.length ? engine.store.find(chain[index + 1]) : undefined
  const nextHost = next !== undefined ? next.host : entry.host
  const nextPort = next !== undefined ? next.port : entry.port
  // 关键：上一跳的 forwardOut stream 就是下一跳的 sock
  sock = await new Promise((resolve, reject) => {
    hopClient.forwardOut('127.0.0.1', 0, nextHost, nextPort, (error, stream) => {
      if (error !== undefined) reject(error); else resolve(stream)
    })
  })
}
const target = await connectClient(buildConnectConfig(entry, sock, engine.opts), onKeyboardInteractive)
```

失败时 `for (const client of hops) client.end()` 全部回收，保证不泄漏中间跳连接。

### 5.6 键盘交互（2FA / 动态口令）

```ts
client.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  if (onKeyboardInteractive !== undefined) {
    onKeyboardInteractive(name, instructions, instructionsLang,
      prompts.map(p => ({ prompt: p.prompt, echo: Boolean(p.echo) })), finish)
    return
  }
  // 内置回退：若已配置 password 且所有 prompt 都在问 password，自动应答
  if (config.password !== undefined && prompts.length > 0 && prompts.every(p => /password/i.test(p.prompt))) {
    finish(prompts.map(() => config.password as string))
    return
  }
  fail(new Error('Authentication failed (keyboard-interactive): ' + (prompts.map(p => p.prompt.trim()).join(', ') || 'unsupported interactive challenge')))
})
```

### 5.7 主机配置持久化（原子写 + 权限）

```ts
private save(file: StoreFile): void {
  const dir = dirname(this.path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
  const tmp = this.path + '.tmp'
  writeFileSync(tmp, JSON.stringify(file, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, this.path)     // 原子替换
  this.cache = undefined
}
```

读取侧带 mtime+size 缓存；文件损坏时自动 `rename` 成 `*.corrupt-<ts>` 并从空列表启动，不会静默覆盖。

---

## 六、融合风险清单与建议

| # | 风险 | 等级 | 建议 |
| --- | --- | --- | --- |
| 1 | `schemastery` / `dsh-settings` / `dsh-tools` 是运行时依赖却声明在 devDependencies | 高 | 补齐 dependencies，或裁掉设置面板与工具注册路径 |
| 2 | loopback 围栏不信任 X-Forwarded-For，反代后全 403 | 高 | 若需代理访问，改造 `isLoopbackRequest` 或在其前置一层；`loopback.ts` 是 `scripts/sync-shared.mjs` 生成文件，改了会被同步覆盖，需同时改 shared 源 |
| 3 | 浏览器半区向 dsh-market.com 上报安装心跳 | 中 | 融合时删除 `client/index.ts:79` 的 `reportDailyHeartbeat(...)` |
| 4 | 密码/密钥口令明文存 `~/.dsh/dsh-ssh.json` | 中 | 沿用其信任模型但限制文件权限 0600；若 Dolphin 有密钥管理设施，建议替换 `HostStore` 的读写后端 |
| 5 | 断线重连最多 3 次会重放非幂等命令 | 中 | 有副作用的命令调用 `withClient(..., attempts = 1)` |
| 6 | `ssh_upload`/`ssh_download` 以宿主权限读写本机任意路径，不经沙箱 | 中 | 融合时建议在路由层加路径白名单 |
| 7 | exec 输出原样返回不脱敏 | 中 | 可在 `appendOutput` 之后加一层敏感信息过滤 |
| 8 | ssh2 的可选 native 依赖 `cpu-features` + `nan` | 低 | 离线打包可直接去掉，ssh2 回退纯 JS 实现 |
| 9 | `loopback.ts` / `http.ts` / `dsh-home.ts` / `mount-once.ts` / `telemetry.ts` 均为生成副本 | 低 | 禁止直接编辑，改 `shared/` 源后跑 `node scripts/sync-shared.mjs` |
| 10 | 模块要求 Node ^22.19 \|\| >=24 | 低 | 确认 Dolphin 运行时版本满足 |

### 推荐融合路径（由易到难）

**方案 A（推荐，改动最小）**：只取 `engine/` + `store.ts` + `protocol.ts`，剥掉 `routes.ts` / `tools.ts` / `client/` / `index.ts`。
- 依赖只剩 `ssh2`
- 无 cordis、无 Web 服务器、无遥测、无 loopback 围栏问题
- 直接 `new HostStore(path)` + `new SshEngine(store)` 即可拿到 exec / cluster / upload / download / tunnel 全部能力

**方案 B**：保留 Agent 工具面，需引入 `defineTool` 机制（可自行实现一个极简注册器替换 `@deepseek-ai/dsh-tools`）

**方案 C**：全量保留（含 GUI 与 Web 终端），需完整 DSH 宿主环境 + cordis + 补齐 3 个 devDep

---

## 七、附录：源码地图

```
src/
├── index.ts              177  插件入口（cordis 契约）— 无 connect/exec/run 导出
├── engine.ts             175  ★ SshEngine 门面类（exec / cluster / shell / sftp / tunnel）
├── engine/
│   ├── connection-pool.ts 385  ★ 连接池、建连参数、execCommand、重试、ProxyJump
│   ├── sftp.ts            225  SFTP 上传/下载/列目录
│   ├── pty.ts              77  PTY 交互终端
│   ├── tunnel.ts          138  本地端口转发
│   └── cluster.ts          50  集群并发执行
├── store.ts              395  ★ HostStore（~/.dsh/dsh-ssh.json + ~/.ssh/config 导入）
├── protocol.ts           201  ★ 全部类型 + SSH_API 路由常量
├── routes.ts             568  /api/dsh-ssh 路由族 + WebSocket 终端升级
├── tools.ts              371  6 个 Agent 工具定义
├── http.ts               105  [生成] JSON 读写助手
├── loopback.ts            63  [生成] ★ 回环围栏（融合最大坑）
├── dsh-home.ts            41  [生成] DSH_HOME 解析
├── mount-once.ts          48  [生成] 单实例守卫
├── invariant.ts            4  空实现
└── client/             ~1500  浏览器半区（面板 / 终端 / 遥测）
tests/                    24 个文件，含内嵌 ssh2 Server 与真实 sshd 测试夹具
```

标 ★ 的是融合时真正需要通读的文件，合计约 1,350 行。
