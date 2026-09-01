// ============================================================================
// dolphin-ssh-core.js —— Project Dolphin 的「手」：远程巡检 SSH 核心
// ----------------------------------------------------------------------------
// 来源：基于 Apache-2.0 许可的 dsh-ssh（dsh-web/packages/dsh-ssh/src）独立封装
//   保留：engine.ts · engine/connection-pool.ts · engine/sftp.ts
//         engine/cluster.ts · store.ts · protocol.ts
//   适配：移除 cordis / @deepseek-ai/dsh-settings / @deepseek-ai/dsh-tools 等
//         宿主专属上下文，以及仅面向 Web 界面的 client 与 pty / tunnel 模块
//   → 本文件零 DSH 依赖、零对外网络回连，运行时唯一三方依赖是 ssh2。
//
// 模块格式说明（重要）：
//   D:\Dolphin\package.json 声明了 "type": "module"，同目录的 dolphin-core.js
//   也是 ESM。在 type:module 下，.js 文件无法使用 require / module.exports，
//   强行写 CJS 会导致 node 直接抛 ReferenceError。因此本文件为 ESM，
//   但对 CJS 生态的 ssh2 使用 createRequire 兼容加载，调用方式与 CJS 一致：
//     import { createHostStore, createSshEngine } from './dolphin-ssh-core.js'
//
// 用法：
//   node dolphin-ssh-core.js            跑内置自检（不建立任何真实连接）
// ============================================================================

import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// ============================================================================
// 0. ssh2 惰性解析
// ----------------------------------------------------------------------------
// ssh2 1.17 是 CJS 包。这里刻意做成惰性加载：模块导入、建库、列主机、校验
// 等路径完全不触碰 ssh2，只有真正发起连接时才解析。这样在 ssh2 尚未安装的
// 机器上，本文件依然能被正常 import 和自检。
// ============================================================================

let ssh2Module

/** 解析 ssh2（失败时给出可执行的修复提示）。 */
function loadSsh2() {
  if (ssh2Module !== undefined) return ssh2Module
  const override = process.env.DOLPHIN_SSH2_MODULE
  const candidates = override !== undefined && override !== '' ? [override, 'ssh2'] : ['ssh2']
  let lastError
  for (const spec of candidates) {
    try {
      ssh2Module = require(spec)
      return ssh2Module
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(
    '缺少依赖 ssh2：npm install ssh2@1.17.0\n' +
    '若已装在别处，可用 DOLPHIN_SSH2_MODULE=<绝对路径或包名> 指定。\n' +
    '原始错误：' + (lastError instanceof Error ? lastError.message : String(lastError)),
  )
}

/** ssh2 是否可用（只读探测，不抛异常）。 */
export function isSsh2Available() {
  try {
    loadSsh2()
    return true
  } catch {
    return false
  }
}

// ============================================================================
// 1. protocol.ts —— 纯类型契约（运行时为空，仅保留 JSDoc）
// ============================================================================

/**
 * @typedef {'key'|'password'|'agent'} SshAuthKind
 *
 * @typedef {Object} SshHostEntry
 * @property {string} alias
 * @property {string} host
 * @property {number} port
 * @property {string} user
 * @property {{kind: SshAuthKind, keyPath?: string, passphrase?: string,
 *             password?: string, agentPath?: string}} auth
 * @property {string[]} proxyJump
 * @property {string} [description]
 * @property {string} [environment]
 * @property {string[]} tags
 * @property {string} [location]
 * @property {number} createdAt
 * @property {number} updatedAt
 *
 * @typedef {Object} SshHostSummary  // 脱敏投影，不含任何密钥
 * @typedef {Object} ExecResult
 * @property {boolean} success
 * @property {number|null} exitCode
 * @property {boolean} timedOut
 * @property {string} stdout
 * @property {string} stderr
 * @property {number} durationMs
 * @property {string} [error]
 *
 * @typedef {Object} ClusterResult
 * @typedef {Object} TestResult
 * @property {boolean} ok
 * @property {number} [latencyMs]
 * @property {string} [error]
 *
 * @typedef {Object} TransferProgress
 * @typedef {Object} RemoteDirEntry
 */

// protocol.ts 中仅面向 HTTP 路由与 Web 界面的导出未纳入本模块：
//   SSH_API_BASE / SSH_API / TerminalServerFrame / TerminalClientFrame
//   TransferStreamLine / ApiErrorBody

// ============================================================================
// 2. dsh-home.ts —— DSH_HOME 解析（移除 @deepseek-ai/dsh-settings 依赖后内联）
// ----------------------------------------------------------------------------
// 与 DSH 解耦后不再默认读写 ~/.dsh，改为优先 ~/.dolphin，避免和宿主插件抢目录。
// ============================================================================

/**
 * 解析 Dolphin 数据目录。
 * 优先级：$DOLPHIN_HOME > $DSH_HOME > ~/.dolphin
 */
export function resolveDolphinHome(env = process.env, home = homedir()) {
  const raw = env.DOLPHIN_HOME ?? env.DSH_HOME
  if (raw !== undefined && raw.trim() !== '') {
    const expanded = expandHome(raw.trim(), home)
    return isAbsolute(expanded) ? expanded : join(process.cwd(), expanded)
  }
  return join(home, '.dolphin')
}

/** 展开路径前缀的 ~。 */
export function expandHome(path, home = homedir()) {
  if (path === '~') return home
  if (path.startsWith('~/') || path.startsWith('~\\')) return join(home, path.slice(2))
  return path
}

// ============================================================================
// 3. store.ts —— 主机配置存储（纯文件 I/O，无 cordis）
// ----------------------------------------------------------------------------
// 原子写：写 .tmp 再 rename；权限 0600（Windows 上 mode 基本被忽略，无害）。
// 文件损坏时 rename 为 .corrupt-<ts> 并降级为空库，绝不静默覆盖。
// ============================================================================

const FORMAT_VERSION = 1

/** 默认存储文件位置。 */
export function storePath() {
  return join(resolveDolphinHome(), 'dolphin-ssh-hosts.json')
}

/** 标准 OpenSSH 配置路径（导入用）。 */
export function sshConfigPath() {
  return join(homedir(), '.ssh', 'config')
}

/** 别名语法：字母数字开头，允许点、连字符、下划线。 */
const ALIAS_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/

/** 校验别名，返回错误信息或 undefined。 */
export function validateAlias(alias) {
  if (!ALIAS_RE.test(alias)) return 'alias must be letters, digits, dots, hyphens or underscores'
  return undefined
}

/** 校验主机 payload，返回错误信息或 undefined。 */
export function validateHostPayload(payload) {
  if (typeof payload !== 'object' || payload === null) return 'body must be a JSON object'
  const p = payload
  if (typeof p.host !== 'string' || p.host.trim() === '') return 'host is required'
  if (typeof p.user !== 'string' || p.user.trim() === '') return 'user is required'
  const auth = p.auth
  if (auth !== undefined) {
    if (typeof auth !== 'object' || auth === null) return 'auth must be an object'
    if (auth.kind !== 'key' && auth.kind !== 'password' && auth.kind !== 'agent') return 'auth.kind must be key, password or agent'
    if (auth.kind === 'key' && (typeof auth.keyPath !== 'string' || auth.keyPath.trim() === '')) {
      return 'auth.keyPath is required for key auth'
    }
    if (auth.kind === 'password' && auth.password !== undefined && typeof auth.password !== 'string') {
      return 'auth.password must be a string when provided'
    }
    if (auth.kind === 'agent' && auth.agentPath !== undefined && typeof auth.agentPath !== 'string') {
      return 'auth.agentPath must be a string when provided'
    }
  }
  if (p.port !== undefined && (typeof p.port !== 'number' || !Number.isInteger(p.port) || p.port < 1 || p.port > 65535)) {
    return 'port must be an integer in 1..65535'
  }
  if (p.proxyJump !== undefined && (!Array.isArray(p.proxyJump) || p.proxyJump.some(x => typeof x !== 'string' || x === ''))) {
    return 'proxyJump must be an array of alias strings'
  }
  if (p.tags !== undefined && (!Array.isArray(p.tags) || p.tags.some(x => typeof x !== 'string'))) {
    return 'tags must be an array of strings'
  }
  return undefined
}

/** 规范化 agent 端点：去掉空白、展开 ~、解析 SSH_AUTH_SOCK 记号。 */
export function normalizeAgentPath(agentPath) {
  const trimmed = agentPath?.trim()
  if (trimmed === undefined || trimmed === '') return undefined
  if (trimmed === 'SSH_AUTH_SOCK' || trimmed === '$SSH_AUTH_SOCK') {
    const sock = process.env.SSH_AUTH_SOCK
    return sock !== undefined && sock !== '' ? sock : undefined
  }
  return expandHome(trimmed)
}

export class HostStore {
  /**
   * @param {string} [path] 存储文件路径（默认 ~/.dolphin/dolphin-ssh-hosts.json）
   * @param {string} [sshConfigOverride] 仅测试用：覆盖 ~/.ssh/config 路径
   */
  constructor(path, sshConfigOverride) {
    this.path = resolve(path ?? storePath())
    this.sshConfigOverride = sshConfigOverride
    this.skippedNames = new Set()
    this.cache = undefined
  }

  list() {
    return this.load().hosts
  }

  find(alias) {
    return this.list().find(entry => entry.alias === alias)
  }

  /** 脱敏投影：永不外泄 password / passphrase / 私钥内容。 */
  summarize(entry) {
    let keyReady = true
    if (entry.auth.kind === 'key' && entry.auth.keyPath) {
      keyReady = existsSync(expandHome(entry.auth.keyPath))
    } else if (entry.auth.kind === 'agent') {
      keyReady = false
    }
    return {
      alias: entry.alias,
      host: entry.host,
      port: entry.port,
      user: entry.user,
      auth: entry.auth.kind,
      keyReady,
      proxyJump: [...entry.proxyJump],
      ...(entry.description !== undefined ? { description: entry.description } : {}),
      ...(entry.environment !== undefined ? { environment: entry.environment } : {}),
      tags: [...entry.tags],
      ...(entry.location !== undefined ? { location: entry.location } : {}),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }
  }

  create(payload) {
    const alias = payload.alias?.trim()
    if (!alias) throw new Error('alias is required')
    const aliasError = validateAlias(alias)
    if (aliasError !== undefined) throw new Error(aliasError)
    const bodyError = validateHostPayload(payload)
    if (bodyError !== undefined) throw new Error(bodyError)
    if (payload.auth === undefined) throw new Error('auth is required')
    const file = this.load()
    if (file.hosts.some(entry => entry.alias === alias)) throw new Error(`alias '${alias}' already exists`)
    const now = Date.now()
    const entry = {
      alias,
      host: payload.host.trim(),
      port: payload.port ?? 22,
      user: payload.user.trim(),
      auth: {
        kind: payload.auth.kind,
        keyPath: payload.auth.kind === 'key' ? expandHome(payload.auth.keyPath?.trim() ?? '') : undefined,
        passphrase: payload.auth.kind === 'key' ? payload.auth.passphrase ?? undefined : undefined,
        password: payload.auth.kind === 'password' ? payload.auth.password : undefined,
        agentPath: payload.auth.kind === 'agent' ? normalizeAgentPath(payload.auth.agentPath) : undefined,
      },
      proxyJump: [...(payload.proxyJump ?? [])],
      description: payload.description?.trim() || undefined,
      environment: payload.environment?.trim() || undefined,
      tags: [...(payload.tags ?? [])].map(tag => tag.trim()).filter(tag => tag !== ''),
      location: payload.location?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }
    file.hosts.push(entry)
    this.save(file)
    return entry
  }

  update(alias, patch) {
    const file = this.load()
    const entry = file.hosts.find(candidate => candidate.alias === alias)
    if (entry === undefined) throw new Error(`alias '${alias}' not found`)
    if (patch.host !== undefined && (typeof patch.host !== 'string' || patch.host.trim() === '')) {
      throw new Error('host is required')
    }
    if (patch.user !== undefined && (typeof patch.user !== 'string' || patch.user.trim() === '')) {
      throw new Error('user is required')
    }
    if (patch.port !== undefined && (typeof patch.port !== 'number' || !Number.isInteger(patch.port) || patch.port < 1 || patch.port > 65535)) {
      throw new Error('port must be an integer in 1..65535')
    }
    if (patch.proxyJump !== undefined && (!Array.isArray(patch.proxyJump) || patch.proxyJump.some(x => typeof x !== 'string' || x === ''))) {
      throw new Error('proxyJump must be an array of alias strings')
    }
    if (patch.tags !== undefined && (!Array.isArray(patch.tags) || patch.tags.some(x => typeof x !== 'string'))) {
      throw new Error('tags must be an array of strings')
    }
    if (patch.host !== undefined) entry.host = patch.host.trim()
    if (patch.port !== undefined) entry.port = patch.port
    if (patch.user !== undefined) entry.user = patch.user.trim()
    if (patch.auth !== undefined) {
      const auth = patch.auth
      if (auth.kind !== 'key' && auth.kind !== 'password' && auth.kind !== 'agent') throw new Error('auth.kind must be key, password or agent')
      if (auth.kind === 'key' && (typeof auth.keyPath !== 'string' || auth.keyPath.trim() === '')) {
        throw new Error('auth.keyPath is required for key auth')
      }
      if (auth.kind === 'password' && auth.password !== undefined && typeof auth.password !== 'string') {
        throw new Error('auth.password must be a string when provided')
      }
      if (auth.kind === 'agent' && auth.agentPath !== undefined && typeof auth.agentPath !== 'string') {
        throw new Error('auth.agentPath must be a string when provided')
      }
      // 换了密钥路径但没给 passphrase ⇒ 新密钥没有口令；只有路径不变时才沿用旧口令。
      const keyChanged = auth.kind === 'key'
        && auth.keyPath !== undefined
        && expandHome(auth.keyPath.trim()) !== entry.auth.keyPath
      entry.auth = {
        kind: auth.kind,
        keyPath: auth.kind === 'key' ? expandHome(auth.keyPath?.trim() ?? '') : undefined,
        passphrase: auth.kind === 'key'
          ? (auth.passphrase !== undefined ? auth.passphrase : (keyChanged ? undefined : entry.auth.passphrase))
          : undefined,
        password: auth.kind === 'password' ? auth.password : undefined,
        agentPath: auth.kind === 'agent'
          ? (auth.agentPath !== undefined ? normalizeAgentPath(auth.agentPath) : entry.auth.agentPath)
          : undefined,
      }
    }
    if (patch.proxyJump !== undefined) entry.proxyJump = [...patch.proxyJump]
    if (patch.description !== undefined) entry.description = patch.description.trim() || undefined
    if (patch.environment !== undefined) entry.environment = patch.environment.trim() || undefined
    if (patch.tags !== undefined) entry.tags = [...patch.tags].map(tag => tag.trim()).filter(tag => tag !== '')
    if (patch.location !== undefined) entry.location = patch.location.trim() || undefined
    entry.updatedAt = Date.now()
    this.save(file)
    return entry
  }

  delete(alias) {
    const file = this.load()
    const index = file.hosts.findIndex(candidate => candidate.alias === alias)
    if (index < 0) throw new Error(`alias '${alias}' not found`)
    file.hosts.splice(index, 1)
    this.save(file)
  }

  /** 从 ~/.ssh/config 导入（跳过通配符块、无 HostName 的块、已存在的别名）。 */
  importFromSshConfig() {
    this.skippedNames = new Set()
    const configPath = this.sshConfigOverride ?? sshConfigPath()
    if (!existsSync(configPath)) return { parsed: 0, added: 0, skipped: 0, skippedNames: [] }
    const lines = readFileSync(configPath, 'utf8').split(/\r?\n/)
    const blocks = []
    let current
    const skip = (name, seen) => {
      if (name !== '' && !seen.has(name)) {
        seen.add(name)
        this.skippedNames.add(name)
      }
    }
    for (const raw of lines) {
      const line = raw.trim()
      if (line === '' || line.startsWith('#')) continue
      const match = /^([A-Za-z0-9_\-]+)\s+(.+)$/.exec(line)
      if (match === null) continue
      const key = match[1].toLowerCase()
      const value = match[2].trim()
      if (key === 'host') {
        current = { pattern: value, props: {} }
        blocks.push(current)
      } else if (current !== undefined) {
        current.props[key] = value
      }
    }
    let added = 0
    for (const block of blocks) {
      const pattern = block.pattern.split(/\s+/)[0]
      if (pattern.includes('*') || pattern.includes('?')) {
        skip(pattern, this.skippedNames)
        continue
      }
      const hostName = block.props.hostname
      if (hostName === undefined || hostName === '') {
        skip(pattern, this.skippedNames)
        continue
      }
      if (this.list().some(entry => entry.alias === pattern)) {
        skip(pattern, this.skippedNames)
        continue
      }
      const payload = {
        alias: pattern,
        host: hostName,
        port: block.props.port !== undefined ? Number.parseInt(block.props.port, 10) : 22,
        user: block.props.user ?? process.env.USER ?? 'root',
        auth: {
          kind: block.props.identityfile !== undefined
            ? 'key'
            : block.props.identityagent !== undefined && block.props.identityagent.toLowerCase() !== 'none'
              ? 'agent'
              : 'password',
          keyPath: block.props.identityfile,
          password: block.props.password,
          agentPath: block.props.identityagent !== undefined && block.props.identityagent.toLowerCase() !== 'none'
            ? normalizeAgentPath(block.props.identityagent)
            : undefined,
        },
        proxyJump: block.props.proxyjump !== undefined
          ? block.props.proxyjump.split(',').map(hop => hop.trim()).filter(hop => hop !== '')
          : [],
        description: block.props.description,
        environment: block.props.environment,
        tags: (block.props.tags ?? '').split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        location: block.props.location,
      }
      try {
        this.create(payload)
        added += 1
      } catch {
        skip(pattern, this.skippedNames)
      }
    }
    return { parsed: blocks.length, added, skipped: this.skippedNames.size, skippedNames: [...this.skippedNames] }
  }

  /** 按 mtime+size 缓存：list/find 每次建连都会走，文件没变就别重复解析。 */
  load() {
    let stats
    try {
      stats = statSync(this.path)
    } catch {
      this.cache = undefined
      return { version: FORMAT_VERSION, hosts: [] }
    }
    if (this.cache !== undefined && this.cache.mtimeMs === stats.mtimeMs && this.cache.size === stats.size) {
      return this.cache.file
    }
    try {
      const parsed = JSON.parse(readFileSync(this.path, 'utf8'))
      if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.hosts)) {
        throw new Error('store file shape invalid')
      }
      this.cache = { mtimeMs: stats.mtimeMs, size: stats.size, file: parsed }
      return parsed
    } catch {
      // 损坏的库不能让插件变砖，也不能被下次 save 静默覆盖 —— 改名留档后从空库启动。
      this.cache = undefined
      try {
        renameSync(this.path, `${this.path}.corrupt-${Date.now()}`)
      } catch { /* best effort */ }
      return { version: FORMAT_VERSION, hosts: [] }
    }
  }

  save(file) {
    const dir = dirname(this.path)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
    const tmp = this.path + '.tmp'
    writeFileSync(tmp, JSON.stringify(file, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
    renameSync(tmp, this.path)
    this.cache = undefined
  }
}

/**
 * 工厂：实例化 HostStore。
 * @param {string} [path] 存储文件路径，省略则用默认位置
 * @returns {HostStore}
 */
export function createHostStore(path) {
  return new HostStore(path)
}

// ============================================================================
// 4. engine/connection-pool.ts —— 连接池、跳板链、exec
// ============================================================================

/** 引擎默认旋钮。 */
export const DEFAULTS = {
  idleTimeoutMs: 30 * 60_000,
  connectTimeoutMs: 15_000,
  keepaliveIntervalMs: 15_000,
  maxOutputBytes: 2 * 1024 * 1024,
  defaultExecTimeoutMs: 60_000,
  defaultMaxWorkers: 8,
  sftpConcurrency: 8,
}

/**
 * 为一条主机记录构造 ssh2 连接配置（私钥按内容读入，不是路径）。
 * @param {SshHostEntry} entry
 * @param {*} [sock] 跳板链传下来的 stream
 * @param {typeof DEFAULTS} opts
 */
export function buildConnectConfig(entry, sock, opts = DEFAULTS) {
  const config = {
    host: entry.host,
    port: entry.port,
    username: entry.user,
    readyTimeout: opts.connectTimeoutMs,
    keepaliveInterval: opts.keepaliveIntervalMs,
    keepaliveCountMax: 3,
    tryKeyboard: true,
  }
  if (sock !== undefined) config.sock = sock
  if (entry.auth.kind === 'password') {
    config.password = entry.auth.password
  } else if (entry.auth.kind === 'agent') {
    const agentPath = resolveAgentPath(entry.auth.agentPath)
    if (agentPath === undefined) {
      throw new Error('ssh-agent is not available: set SSH_AUTH_SOCK or configure an agent path (use \'pageant\' for PuTTY Pageant on Windows)')
    }
    config.agent = agentPath
  } else {
    const keyPath = entry.auth.keyPath === undefined ? undefined : expandHome(entry.auth.keyPath)
    if (keyPath === undefined || !existsSync(keyPath)) {
      throw new Error('private key not found: ' + (entry.auth.keyPath ?? '(unset)'))
    }
    config.privateKey = readFileSync(keyPath, 'utf8')
    if (entry.auth.passphrase !== undefined && entry.auth.passphrase !== '') {
      config.passphrase = entry.auth.passphrase
    }
  }
  return config
}

/** 解析 agent 端点：显式路径 > $SSH_AUTH_SOCK > Windows 回退 pageant。 */
export function resolveAgentPath(agentPath) {
  const explicit = normalizeAgentPath(agentPath)
  if (explicit !== undefined) return explicit
  const sock = process.env.SSH_AUTH_SOCK
  if (sock !== undefined && sock !== '') return sock
  if (process.platform === 'win32') return 'pageant'
  return undefined
}

/** 建一个 ssh2 client（ready 兑现，error/close 拒绝）。 */
export function connectClient(config, onKeyboardInteractive) {
  const { Client } = loadSsh2()
  return new Promise((resolvePromise, reject) => {
    const client = new Client()
    let settled = false
    const fail = (error) => {
      if (settled) return
      settled = true
      try { client.destroy() } catch { /* already closed */ }
      reject(error instanceof Error ? error : new Error(String(error)))
    }
    client.once('ready', () => {
      if (settled) return
      settled = true
      resolvePromise(client)
    })
    client.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
      if (onKeyboardInteractive !== undefined) {
        onKeyboardInteractive(name, instructions, instructionsLang, prompts.map(p => ({ prompt: p.prompt, echo: Boolean(p.echo) })), finish)
        return
      }
      // 已配置 password 且所有提示都在问密码 ⇒ 自动应答（PAM 兜底）
      if (config.password !== undefined && prompts.length > 0 && prompts.every(p => /password/i.test(p.prompt))) {
        finish(prompts.map(() => config.password))
        return
      }
      fail(new Error('Authentication failed (keyboard-interactive): ' + (prompts.map(p => p.prompt.trim()).join(', ') || 'unsupported interactive challenge')))
    })
    // 握手后仍保留 error 监听：TCP 通但握手断时 ssh2 会二次 emit error，
    // 没有兜底监听就会变成 unhandled 'error'。settled 守卫让后续 emit 变空操作。
    client.on('error', fail)
    try {
      client.connect(config)
    } catch (error) {
      fail(error)
    }
  })
}

/** 按字节预算截断输出（标记 truncated，且不切断代理对）。 */
export function appendOutput(target, chunk, maxBytes) {
  if (target.truncated) return
  if (target.text.length + chunk.length > maxBytes) {
    let cut = chunk.toString('utf8').slice(0, maxBytes - target.text.length)
    if (/[\uD800-\uDBFF]$/.test(cut)) cut = cut.slice(0, -1)
    target.text += cut + '…[output truncated]'
    target.truncated = true
    return
  }
  target.text += chunk.toString('utf8')
}

/**
 * 建立完整跳板链：逐跳 forwardOut，末跳连目标。
 * 任一环节失败都会 end 掉已建立的跳，绝不泄漏中间连接。
 */
export async function connectChain(engine, entry, onKeyboardInteractive) {
  const hops = []
  let sock
  const chain = entry.proxyJump
  try {
    for (let index = 0; index < chain.length; index += 1) {
      const hopAlias = chain[index]
      const hop = engine.store.find(hopAlias)
      if (hop === undefined) {
        throw new Error('proxyJump alias \'' + hopAlias + '\' not found — create it first')
      }
      const hopClient = await connectClient(buildConnectConfig(hop, sock, engine.opts), onKeyboardInteractive)
      hops.push(hopClient)
      const next = index + 1 < chain.length ? engine.store.find(chain[index + 1]) : undefined
      const nextHost = next !== undefined ? next.host : entry.host
      const nextPort = next !== undefined ? next.port : entry.port
      sock = await new Promise((resolvePromise, reject) => {
        hopClient.forwardOut('127.0.0.1', 0, nextHost, nextPort, (error, stream) => {
          if (error !== undefined) reject(error)
          else resolvePromise(stream)
        })
      })
    }
  } catch (error) {
    for (const client of hops) client.end()
    throw error
  }
  let target
  try {
    target = await connectClient(buildConnectConfig(entry, sock, engine.opts), onKeyboardInteractive)
    return { client: target, hops }
  } catch (error) {
    for (const client of hops) client.end()
    if (target !== undefined) {
      try { target.destroy() } catch { /* already destroyed */ }
    }
    throw error
  }
}

/** 取（或建）某别名的池化连接；同名并发只建一次。 */
export async function acquire(engine, alias) {
  const pending = engine.acquireQueue.get(alias)
  if (pending !== undefined) return pending
  const task = doAcquire(engine, alias)
  engine.acquireQueue.set(alias, task)
  try {
    return await task
  } finally {
    if (engine.acquireQueue.get(alias) === task) engine.acquireQueue.delete(alias)
  }
}

async function doAcquire(engine, alias) {
  const entry = engine.store.find(alias)
  if (entry === undefined) throw new Error('alias \'' + alias + '\' not found — add it first')
  const { client, hops } = await connectChain(engine, entry)
  const record = { client, hops, idleAt: Date.now(), pinned: false, broken: false, inFlight: 0 }
  client.on('error', () => { record.broken = true })
  client.on('close', () => { record.broken = true })
  engine.pool.set(alias, record)
  return record
}

/** 拆掉某别名的连接；并发重建后旧记录不再属于调用者时不动。 */
export function disposeRecord(engine, alias, record) {
  const current = engine.pool.get(alias)
  if (record !== undefined && current !== record) return
  if (current === undefined) return
  engine.pool.delete(alias)
  endRecordChain(current)
}

export function endRecordChain(record) {
  try { record.client.end() } catch { /* already closed */ }
  for (const hop of record.hops) {
    try { hop.end() } catch { /* already closed */ }
  }
}

/** 清扫空闲连接（跳过 pinned 与在途操作）。 */
export function sweepPool(engine) {
  const cutoff = Date.now() - engine.opts.idleTimeoutMs
  for (const [alias, record] of engine.pool) {
    if (!record.pinned && record.inFlight === 0 && record.idleAt < cutoff) {
      disposeRecord(engine, alias, record)
    }
  }
}

/**
 * 带重连的操作包裹器。
 * 只有连接真的断了才重放 —— 健康连接上的失败是逻辑错误，直接抛出不重放。
 * ⚠️ 重连重放会重复执行非幂等命令；跑部署类命令请传 attempts = 1。
 */
export async function withClient(engine, alias, fn, attempts = 3) {
  let lastError
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
      if (!record.broken) throw error
      disposeRecord(engine, alias, record)
    } finally {
      record.inFlight -= 1
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/** 在 alias 上执行一条命令（复用池化连接）。 */
export async function execCommand(engine, alias, command, timeoutMs, attempts) {
  const started = Date.now()
  const budget = timeoutMs !== undefined && timeoutMs > 0 ? timeoutMs : engine.opts.defaultExecTimeoutMs
  return withClient(engine, alias, async (client) => {
    return await new Promise((resolvePromise, reject) => {
      client.exec(command, (error, stream) => {
        if (error !== undefined) {
          reject(error)
          return
        }
        const stdout = { text: '', truncated: false }
        const stderr = { text: '', truncated: false }
        let timedOut = false
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolvePromise({
            success: false,
            exitCode: null,
            timedOut,
            stdout: stdout.text,
            stderr: stderr.text,
            durationMs: Date.now() - started,
            error: timedOut ? 'command timed out after ' + budget + ' ms' : undefined,
          })
        }
        const timer = setTimeout(() => {
          timedOut = true
          try { stream.signal('KILL') } catch { /* channel gone */ }
          try { stream.close() } catch { /* channel gone */ }
          // 硬截止：对端不 ack 也立刻结算，后续 stream 'close' 变空操作。
          finish()
        }, budget)
        stream.on('data', (chunk) => appendOutput(stdout, chunk, engine.opts.maxOutputBytes))
        stream.stderr.on('data', (chunk) => appendOutput(stderr, chunk, engine.opts.maxOutputBytes))
        stream.on('close', (code) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          if (typeof code !== 'number' && !timedOut) {
            // 通道没有退出码就关闭 = 连接中途掉了；抛错让 withClient 重连重试。
            reject(new Error('ssh: connection lost mid-flight (channel closed without an exit status)'))
            return
          }
          resolvePromise({
            success: code === 0,
            exitCode: code,
            timedOut,
            stdout: stdout.text,
            stderr: stderr.text,
            durationMs: Date.now() - started,
          })
        })
        stream.on('error', (streamError) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          reject(streamError)
        })
      })
    })
  }, attempts ?? 3)
}

// ============================================================================
// 5. engine/sftp.ts —— 上传 / 下载 / 列目录
// ============================================================================

/** 遍历本地目录，返回所有文件的相对路径（不跟随符号链接）。 */
export function walkLocalDir(root) {
  const files = []
  const visit = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      // 用 lstat 而非 stat：符号链接绝不能跟随（ln -s . self 会无限递归）。
      const stat = lstatSync(full)
      if (stat.isSymbolicLink()) continue
      if (stat.isDirectory()) visit(full)
      else if (stat.isFile()) files.push(relative(root, full).replaceAll('\\', '/'))
    }
  }
  visit(root)
  return files
}

export async function upload(engine, alias, localPath, remotePath, recursive, onProgress) {
  if (!remotePath.startsWith('/')) {
    throw new Error('remotePath must be an absolute path (got \'' + remotePath + '\')')
  }
  const local = resolve(localPath)
  if (!existsSync(local)) throw new Error('local path not found: \'' + localPath + '\'')
  return withClient(engine, alias, (client) => withSftp(client, async (sftp) => {
    const stat = statSync(local)
    let files
    if (stat.isDirectory()) {
      if (!recursive) throw new Error('\'' + localPath + '\' is a directory — enable recursive upload')
      files = walkLocalDir(local)
      await ensureRemoteDir(sftp, remotePath)
    } else {
      files = ['']
      await ensureRemoteDir(sftp, dirname(remotePath))
    }
    let bytes = 0
    for (const rel of files) {
      const src = rel === '' ? local : join(local, rel)
      const remoteRel = rel.split(/[\\/]/).join('/')
      const dst = rel === '' ? remotePath : remotePath.replace(/\/$/, '') + '/' + remoteRel
      await fastTransfer(sftp, 'put', src, dst, engine.opts.sftpConcurrency, onProgress)
      bytes += statSync(src).size
    }
    return { bytes, files: files.length }
  }))
}

export async function download(engine, alias, remotePath, localPath, onProgress) {
  return withClient(engine, alias, (client) => withSftp(client, async (sftp) => {
    const stat = await new Promise((resolvePromise, reject) => {
      sftp.stat(remotePath, (error, stats) => error !== undefined ? reject(error) : resolvePromise(stats))
    })
    if (stat.isDirectory()) {
      throw new Error('\'' + remotePath + '\' is a directory — directory download is not supported yet (download individual files)')
    }
    const local = resolve(localPath)
    if (!existsSync(dirname(local))) mkdirSync(dirname(local), { recursive: true })
    await fastTransfer(sftp, 'get', remotePath, local, engine.opts.sftpConcurrency, onProgress)
    return { bytes: statSync(local).size }
  }))
}

export async function ls(engine, alias, path) {
  return withClient(engine, alias, (client) => withSftp(client, async (sftp) => {
    return await new Promise((resolvePromise, reject) => {
      sftp.readdir(path, (error, list) => {
        if (error !== undefined) {
          reject(error)
          return
        }
        resolvePromise(list.map(item => ({
          name: item.filename,
          type: item.attrs.isDirectory() ? 'dir' : item.attrs.isFile() ? 'file' : 'other',
          size: item.attrs.size,
          mtimeMs: item.attrs.mtime * 1000,
          mode: item.attrs.mode,
        })))
      })
    })
  }))
}

/**
 * 开一个 SFTP 通道并在结算时精确释放一次。
 * ssh2 的 subsystem channel 不 end() 就会一直占着，直到 sshd 的
 * MaxSessions 打满、之后所有 open 全失败。
 */
async function withSftp(client, run) {
  const sftp = await sftpChannel(client)
  let ended = false
  const endOnce = () => {
    if (ended) return
    ended = true
    try { sftp.end() } catch { /* channel already closed */ }
  }
  sftp.once('close', endOnce)
  try {
    return await run(sftp)
  } finally {
    endOnce()
  }
}

function sftpChannel(client) {
  return new Promise((resolvePromise, reject) => {
    client.sftp((error, sftp) => error !== undefined ? reject(error) : resolvePromise(sftp))
  })
}

/** 逐段 stat→mkdir 建远端目录链。 */
function ensureRemoteDir(sftp, remote) {
  return new Promise((resolvePromise, reject) => {
    const segments = remote.replace(/^\/+/, '').split('/').filter(segment => segment !== '')
    const walk = (index) => {
      if (index >= segments.length) {
        resolvePromise()
        return
      }
      const current = '/' + segments.slice(0, index + 1).join('/')
      sftp.stat(current, (statError) => {
        if (statError === undefined) {
          walk(index + 1)
          return
        }
        sftp.mkdir(current, (mkdirError) => {
          if (mkdirError !== undefined) {
            reject(mkdirError)
            return
          }
          walk(index + 1)
        })
      })
    }
    walk(0)
  })
}

function fastTransfer(sftp, kind, src, dst, concurrency, onProgress) {
  return new Promise((resolvePromise, reject) => {
    const file = kind === 'put' ? dst : src
    const finalSize = () => statSync(kind === 'put' ? src : dst).size
    let last = 0
    let lastEmit = 0
    const started = Date.now()
    if (kind === 'put') {
      onProgress?.({ phase: 'transferring', file, transferred: 0, total: statSync(src).size, percent: 0 })
    }
    const step = (transferred, _chunk, total) => {
      const now = Date.now()
      // 节流：高速链路每个 chunk 回调一次，UI 只需要 ~10 帧/秒。
      if (now - lastEmit < 100 && transferred < total) return
      lastEmit = now
      const elapsed = (now - started) / 1000
      onProgress?.({
        phase: 'transferring',
        file,
        transferred,
        total,
        percent: total > 0 ? Math.round((transferred / total) * 1000) / 10 : 0,
        speedBps: elapsed > 0 ? Math.round((transferred - last) / elapsed) : undefined,
      })
      last = transferred
    }
    const done = (error) => {
      if (error !== undefined) {
        onProgress?.({ phase: 'error', file, transferred: 0, total: 0, percent: 0, error: String(error) })
        reject(error)
      } else {
        onProgress?.({ phase: 'done', file, transferred: finalSize(), total: finalSize(), percent: 100 })
        resolvePromise()
      }
    }
    if (kind === 'put') sftp.fastPut(src, dst, { concurrency, step }, done)
    else sftp.fastGet(src, dst, { concurrency, step }, done)
  })
}

// ============================================================================
// 6. engine/cluster.ts —— 批量并发执行
// ============================================================================

/**
 * 在多台主机上并发执行同一条命令。
 * 过滤条件取交集：aliases / environment / tags（tags 为 ALL 语义）。
 */
export async function cluster(engine, options) {
  let targets = engine.store.list()
  if (options.aliases !== undefined && options.aliases.length > 0) {
    targets = targets.filter(entry => options.aliases.includes(entry.alias))
  }
  if (options.environment !== undefined && options.environment !== '') {
    targets = targets.filter(entry => entry.environment === options.environment)
  }
  if (options.tags !== undefined && options.tags.length > 0) {
    targets = targets.filter(entry => options.tags.every(tag => entry.tags.includes(tag)))
  }
  if (targets.length === 0) return []
  if (options.maxWorkers !== undefined && (!Number.isInteger(options.maxWorkers) || options.maxWorkers < 1)) {
    throw new Error('maxWorkers must be a positive integer')
  }
  const workers = Math.min(engine.opts.defaultMaxWorkers, options.maxWorkers ?? engine.opts.defaultMaxWorkers, targets.length)
  const results = []
  const queue = [...targets]
  const run = async () => {
    while (queue.length > 0) {
      const entry = queue.shift()
      try {
        const result = await execCommand(engine, entry.alias, options.command, options.timeoutMs)
        results.push({
          alias: entry.alias,
          ok: result.success,
          exitCode: result.exitCode,
          timedOut: result.timedOut,
          stdout: result.stdout,
          stderr: result.stderr,
          durationMs: result.durationMs,
        })
      } catch (error) {
        results.push({ alias: entry.alias, ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    }
  }
  await Promise.all(Array.from({ length: workers }, () => run()))
  return results
}

// ============================================================================
// 7. engine.ts —— SshEngine 门面
// ----------------------------------------------------------------------------
// 已从原门面移除：openShell（依赖 engine/pty.ts + @xterm 浏览器半区）、
// startTunnel / listTunnels / stopTunnel / stopAllTunnels（依赖 engine/tunnel.ts）、
// tunnels 字段与 nextTunnelId。dropAlias 退化为纯连接回收。
// ============================================================================

export class SshEngine {
  constructor(store, options) {
    this.store = store
    this.opts = { ...DEFAULTS, ...options }
    this.pool = new Map()
    this.acquireQueue = new Map()
    this.sweepTimer = setInterval(() => sweepPool(this), Math.max(10_000, this.opts.idleTimeoutMs / 4))
    this.sweepTimer.unref?.()
  }

  /** 脱敏主机列表（可按 alias/description/host/tags 模糊过滤）。 */
  list(query) {
    const needle = query?.trim().toLowerCase()
    return this.store.list()
      .filter(entry => needle === undefined || needle === ''
        || entry.alias.toLowerCase().includes(needle)
        || (entry.description ?? '').toLowerCase().includes(needle)
        || entry.host.toLowerCase().includes(needle)
        || entry.tags.some(tag => tag.toLowerCase().includes(needle)))
      .map(entry => this.store.summarize(entry))
  }

  find(alias) {
    const entry = this.store.find(alias)
    return entry === undefined ? undefined : this.store.summarize(entry)
  }

  /**
   * 在 alias 上执行一条命令。
   * @param {string} alias
   * @param {string} command
   * @param {number} [timeoutMs]
   * @param {number} [attempts] 断线重连次数；跑非幂等命令请传 1（默认 3）
   */
  async exec(alias, command, timeoutMs, attempts) {
    return execCommand(this, alias, command, timeoutMs, attempts)
  }

  /** 批量并发执行。 */
  async cluster(options) {
    return cluster(this, options)
  }

  /** 连通性探测（执行 echo ok）。 */
  async test(alias) {
    const started = Date.now()
    try {
      const result = await this.exec(alias, 'echo ok', 10_000)
      return result.success
        ? { ok: true, latencyMs: result.durationMs }
        : { ok: false, latencyMs: result.durationMs, error: 'remote exit code ' + result.exitCode }
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - started, error: error instanceof Error ? error.message : String(error) }
    }
  }

  async upload(alias, localPath, remotePath, recursive, onProgress) {
    return upload(this, alias, localPath, remotePath, recursive, onProgress)
  }

  async download(alias, remotePath, localPath, onProgress) {
    return download(this, alias, remotePath, localPath, onProgress)
  }

  async ls(alias, path) {
    return ls(this, alias, path)
  }

  /** 丢弃该别名上的全部活动产物（现在只有连接），下次操作按当前配置重连。 */
  dropAlias(alias) {
    disposeRecord(this, alias)
  }

  /** 关闭所有连接并停掉清扫定时器。 */
  dispose() {
    if (this.sweepTimer !== undefined) clearInterval(this.sweepTimer)
    for (const alias of [...this.pool.keys()]) disposeRecord(this, alias)
  }
}

/**
 * 工厂：实例化 SshEngine。
 * @param {HostStore} store
 * @param {Partial<typeof DEFAULTS>} [options]
 * @returns {SshEngine}
 */
export function createSshEngine(store, options) {
  return new SshEngine(store, options)
}

// ============================================================================
// 8. 自检：node dolphin-ssh-core.js
// ----------------------------------------------------------------------------
// 全程不建立任何真实连接，不写 D:\Dolphin，临时库放在系统临时目录。
// ============================================================================

async function selfTest() {
  const { tmpdir } = await import('node:os')
  const { rmSync } = await import('node:fs')
  const { join: joinPath } = await import('node:path')

  const line = (text = '') => console.log(text)
  const ok = (label, detail = '') => line(`  [PASS] ${label}${detail === '' ? '' : '  → ' + detail}`)
  const info = (label, detail) => line(`  [INFO] ${label}  → ${detail}`)

  line('╔══════════════════════════════════════════════════════════════════════╗')
  line('║  dolphin-ssh-core.js  自检                                            ║')
  line('╚══════════════════════════════════════════════════════════════════════╝')
  line()

  // --- 1. 依赖探测 --------------------------------------------------------
  line('【1】依赖探测')
  const ssh2Ready = isSsh2Available()
  if (ssh2Ready) {
    const mod = loadSsh2()
    ok('ssh2 可解析', `导出 Client=${typeof mod.Client}`)
  } else {
    info('ssh2 未安装', '惰性加载，导入/建库/校验不受影响；建连前需 npm install ssh2@1.17.0')
  }
  ok('零 DSH / cordis 依赖', '本文件仅 import node:* 内置模块')

  // --- 2. HostStore -------------------------------------------------------
  line()
  line('【2】HostStore（临时库，跑完删除）')
  const tmpFile = joinPath(tmpdir(), `dolphin-ssh-selftest-${process.pid}.json`)
  const keyFile = joinPath(tmpdir(), `dolphin-ssh-selftest-${process.pid}.key`)
  writeFileSync(keyFile, '-----BEGIN OPENSSH PRIVATE KEY-----\n(self-test fixture)\n-----END OPENSSH PRIVATE KEY-----\n')
  const store = createHostStore(tmpFile)
  info('库路径', store.path)

  ok('空库 list()', JSON.stringify(store.list()))

  store.create({
    alias: 'web-01',
    host: '192.168.1.10',
    port: 22,
    user: 'ops',
    auth: { kind: 'key', keyPath: keyFile },
    tags: ['prod', 'nginx'],
    environment: 'production',
    description: '前置机',
  })
  store.create({
    alias: 'db-01',
    host: '192.168.1.20',
    user: 'root',
    auth: { kind: 'password', password: 'not-a-real-password' },
    tags: ['prod', 'mysql'],
    environment: 'production',
  })
  store.create({
    alias: 'jump-01',
    host: '10.0.0.1',
    user: 'bastion',
    auth: { kind: 'agent' },
    tags: ['bastion'],
    environment: 'production',
  })
  ok('写入 3 条主机', store.list().map(e => e.alias).join(', '))

  const summary = store.summarize(store.find('db-01'))
  const leaked = JSON.stringify(summary).includes('not-a-real-password')
  ok('summarize() 脱敏', leaked ? '密钥泄漏！' : `auth=${summary.auth}, 无明文口令字段`)
  ok('keyReady 探测', `web-01.keyReady=${store.summarize(store.find('web-01')).keyReady}`)

  const dup = (() => { try { store.create({ alias: 'web-01', host: 'x', user: 'y', auth: { kind: 'agent' } }); return null } catch (e) { return e.message } })()
  ok('重复别名被拒', dup ?? '未拒绝！')
  const badAlias = (() => { try { store.create({ alias: '-bad-', host: 'x', user: 'y', auth: { kind: 'agent' } }); return null } catch (e) { return e.message } })()
  ok('非法别名被拒', badAlias ?? '未拒绝！')
  const badPort = (() => { try { store.create({ alias: 'bad-port', host: 'x', user: 'y', port: 99999, auth: { kind: 'agent' } }); return null } catch (e) { return e.message } })()
  ok('非法端口被拒', badPort ?? '未拒绝！')

  // --- 3. buildConnectConfig ---------------------------------------------
  line()
  line('【3】buildConnectConfig（不建连）')
  const cfgKey = buildConnectConfig(store.find('web-01'), undefined, DEFAULTS)
  ok('key 认证', `host=${cfgKey.host}:${cfgKey.port} username=${cfgKey.username} privateKey=${cfgKey.privateKey.length} 字符（内容不打印）`)
  ok('keepalive', `readyTimeout=${cfgKey.readyTimeout} keepaliveInterval=${cfgKey.keepaliveInterval} keepaliveCountMax=${cfgKey.keepaliveCountMax} tryKeyboard=${cfgKey.tryKeyboard}`)
  const cfgPwd = buildConnectConfig(store.find('db-01'), undefined, DEFAULTS)
  ok('password 认证', `username=${cfgPwd.username} password 已载入=${cfgPwd.password !== undefined}`)

  // --- 4. SshEngine -------------------------------------------------------
  line()
  line('【4】SshEngine')
  const engine = createSshEngine(store)
  ok('暴露接口', ['list', 'find', 'exec', 'cluster', 'test', 'upload', 'download', 'ls', 'dropAlias', 'dispose']
    .map(name => `${name}${typeof engine[name] === 'function' ? '' : '✗'}`).join(', '))
  ok('主机列表', engine.list('prod').map(e => e.alias).join(', '))
  ok('模糊过滤', `list('nginx') → ${engine.list('nginx').map(e => e.alias).join(', ') || '(空)'}`)

  const miss = await engine.exec('no-such-host', 'echo ok')
    .then(() => null, e => e.message)
  ok('未知别名 exec 报错', miss ?? '未报错！')

  const probe = await engine.test('no-such-host')
  ok('未知别名 test 降级', `ok=${probe.ok} error="${probe.error}"`)

  let clusterSafety = ''
  try {
    await engine.cluster({ command: 'echo ok', maxWorkers: 0 })
    clusterSafety = '未校验 maxWorkers！'
  } catch (e) {
    clusterSafety = e.message
  }
  ok('cluster 参数校验', clusterSafety)

  // --- 5. 清理 ------------------------------------------------------------
  engine.dispose()
  ok('dispose() 无异常', `pool.size=${engine.pool.size}`)
  try { rmSync(tmpFile, { force: true }) } catch { /* best effort */ }
  try { rmSync(keyFile, { force: true }) } catch { /* best effort */ }
  ok('临时文件已清理', tmpFile)

  line()
  line('──────────────────────────────────────────────────────────────────────')
  line(`自检结束：ssh2 ${ssh2Ready ? '已就位，可发起真实连接' : '未安装（惰性加载，需时再装）'}`)
  line('默认主机库位置：' + storePath())
  line('──────────────────────────────────────────────────────────────────────')
}

const invokedDirectly = process.argv[1] !== undefined
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  selfTest().then(
    () => process.exit(0),
    (error) => {
      console.error('\n自检失败：', error)
      process.exit(1)
    },
  )
}
