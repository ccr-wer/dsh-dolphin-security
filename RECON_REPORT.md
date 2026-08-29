# Dolphin 源码融合侦察报告

> 侦察对象：`D:\Dolphin\dsh-code-scan`（v0.1.0）
> 侦察日期：2026-08-29
> 涉及文件：`index.js`（36 行）、`lib/scanner.js`（160 行）、`cordis.patch.yml`（5 行）、`package.json`

---

## 0. 结论速览

- 真正可复用的核心逻辑在 **`lib/scanner.js` 的 `scanDirectory()`**：纯 ESM、**零绝对路径**、**零 `__dirname` 拼接**，可脱离 DSH 独立运行（已实测）。
- **`index.js` 只是 Cordis 插件壳**：硬依赖 `@deepseek-ai/dsh-tools` 和 DSH 运行时，脱离 DSH **无法加载**（已实测报 `ERR_MODULE_NOT_FOUND`）。
- 一个容易被误判的点：**该插件对外输出的不是 JSON，而是中文 Markdown 字符串**。JSON 只在它内部消费 semgrep 输出时用到，随后就被拍平成 Markdown 报告。
- 本机当前**未安装 semgrep**，插件会走「友好报错」分支（已实测返回 `未检测到 semgrep 命令`）。

---

## 1. 源码侦察：调用 Semgrep 的具体实现

Semgrep 的调用集中在 `lib/scanner.js` 的 `runSemgrep()` 函数中，**使用的是 `execFile`，不是 `exec`，也不是 `spawn`**。

```js
// lib/scanner.js:4
import { execFile } from 'node:child_process'

// lib/scanner.js:21-52（关键逻辑）
function runSemgrep(targetDir, timeoutMs) {
  return new Promise((resolvePromise) => {
    execFile(
      'semgrep',
      ['scan', '--json', targetDir],
      { timeout: timeoutMs, maxBuffer: 50 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.code === 'ENOENT') {           // 命令不存在
            resolvePromise({ kind: 'missing' })
            return
          }
          if (error.code === 1) {                 // 退出码 1 = 有发现但扫描成功
            resolvePromise({ kind: 'ok', stdout, stderr })
            return
          }
          if (error.killed || error.signal) {     // 超时被杀
            resolvePromise({ kind: 'error', message: `扫描超时（${timeoutMs}ms）...` })
            return
          }
          resolvePromise({ kind: 'error', message: stderr || error.message })
          return
        }
        resolvePromise({ kind: 'ok', stdout, stderr })  // 退出码 0 = 成功无发现
      },
    )
  })
}
```

要点：

| 项 | 值 |
|---|---|
| 子进程 API | `execFile`（Node 内置，非 spawn/exec） |
| 可执行命令 | `semgrep`（依赖 PATH，全局命令） |
| 参数数组 | `['scan', '--json', targetDir]` |
| 超时 | `options.timeoutMs`，默认 **120000 ms** |
| 缓冲区 | `maxBuffer: 50 MB` |
| 退出码语义 | 0=成功无发现；1=成功有发现；2=失败；`ENOENT`=未安装；`killed/signal`=超时 |

> 注意：命令行**只传了 `scan --json <目录>`，没有 `--config`，也没有语言限制参数**。这意味着它完全依赖 semgrep 的默认规则集（首次使用通常需要 `semgrep login` 或依赖内置 registry 规则），本身不锁定任何规则配置。这是融合时最容易被忽略的隐性依赖。

---

## 2. 格式抽取：输入参数与输出结构

### 2.1 输入参数

**底层函数签名**（`lib/scanner.js:128`）：

```js
export async function scanDirectory(targetDir, options = {})
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `targetDir` | string | 必填 | 被扫描目录（调用方需传绝对路径） |
| `options.maxFindings` | number | `200` | 报告中最多显示的漏洞条数 |
| `options.timeoutMs` | number | `120000` | semgrep 超时时间 |

**上层工具参数**（`index.js` 里 `defineTool` 声明的 `code_scan` 工具）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `path` | string | 是 | 目录路径（绝对路径，或相对会话工作目录的相对路径） |

`index.js` 的 `execute` 里会把 `path` 解析成绝对路径再交给 `scanDirectory`：

```js
// index.js:29-30
const cwd = exec.agent?.session?.header?.cwd ?? process.cwd()
const target = isAbsolute(args.path) ? args.path : resolve(cwd, args.path)
```

### 2.2 输出结构（重要：不是 JSON）

`scanDirectory()` 的返回是**二态结果对象，不是 JSON 报告**：

```js
// 成功
{ ok: true,  text: "<中文 Markdown 报告字符串>" }

// 失败
{ ok: false, message: "<友好错误提示>" }
```

`text` 字段是拼装好的 **Markdown 字符串**，形如：

```markdown
# semgrep 扫描报告

- 扫描目录：`D:/xxx`
- 发现问题：共 N 处（ERROR x / WARNING y / INFO z）

## path/to/file.js（2 处）

- [ERROR] 第 12 行 · 规则 `rule-id`：message...
- [WARNING] 第 34 行 · 规则 `rule-id`：message...
```

### 2.3 semgrep 原始 JSON 的 `results` 数组字段抽取

插件内部消费 semgrep 的 `--json` 输出（`results` 数组），`normalizeFindings()`（`lib/scanner.js:55-66`）**只保留了 5 个字段**：

| 输出字段 | 来源（semgrep 原始字段） | 说明 |
|---|---|---|
| `file` | `r.path` | 文件路径 |
| `line` | `r.start.line` | 行号 |
| `severity` | `r.extra.severity`（缺省 `INFO`） | ERROR / WARNING / INFO |
| `checkId` | `r.check_id`（缺省 `unknown`） | 规则 ID |
| `message` | `r.extra.message`（缺省空串） | 问题描述 |

过滤条件（`lib/scanner.js:58`）：`r.path` 存在、`r.start` 存在、`r.start.line` 是数字、`r.extra` 存在，四条缺一即丢弃。

排序规则（`compareFindings`）：先按严重级别（ERROR→WARNING→INFO），同级再按文件名字典序，最后按行号。

> 融合注意：semgrep 原始 JSON 里其实有 `r.extra.lines`（代码片段）、`r.extra.metadata`、`r.start.col`/`r.end` 等更丰富的字段，但**这个插件全部丢掉了**，只保留上述 5 个。如果融合后需要「代码片段高亮」或「列号定位」，得自己从原始 JSON 里重新取，别指望这个函数。

---

## 3. 路径修正（关键）

### 3.1 全局结论：**没有发现绝对路径拼接问题**

逐项核查结果：

| 检查项 | 结果 |
|---|---|
| `path.join(__dirname, ...)` | **无**（全项目未出现） |
| `path.resolve(__dirname, ...)` | **无** |
| `require(...)` 绝对路径 | **无**（且项目是 ESM，根本没有 `require`） |
| 硬编码绝对路径（如 `C:\...`、`/home/...`） | **无** |
| 文件系统读写 | **无**（不读配置、不写报告文件，纯 stdout） |

`lib/scanner.js` 甚至**没有 import `path` 模块**，所有路径都只是作为字符串原样传给 semgrep。

### 3.2 真正需要关注的「路径/环境」冲突点

虽然代码本身没有绝对路径 bug，但有 **4 个运行时耦合点**，融合时会产生冲突：

1. **相对路径解析依赖 DSH 会话 cwd**（`index.js:29`）
   ```js
   const cwd = exec.agent?.session?.header?.cwd ?? process.cwd()
   ```
   `exec.agent?.session?.header?.cwd` 是 DSH 专属字段。脱离 DSH 后它会退化为 `process.cwd()`——**取决于进程启动目录**，而不是被扫描目录，可能扫描错目录。融合时应让调用方显式传绝对路径。

2. **`@deepseek-ai/dsh-tools` 硬依赖**（`index.js:3`）
   ```js
   import { defineTool } from '@deepseek-ai/dsh-tools'
   ```
   该依赖只写在 `package.json` 的 `peerDependencies` 里（`^0.1.0-rc.6`），**没有 `dependencies` 字段**，即 `npm install` 不会自动装上它。实测独立加载 `index.js` 直接报 `ERR_MODULE_NOT_FOUND: Cannot find package '@deepseek-ai/dsh-tools'`。融合时必须由宿主 DSH 提供，或绕开 `index.js` 直接用 `scanner.js`。

3. **ESM 模块格式**（`package.json` 的 `"type": "module"`）
   全项目用 `import`/`export`。若融合进 CommonJS 项目，需 `import()` 动态加载或改写成 CJS。`scanner.js` 无第三方依赖，转 CJS 成本极低。

4. **semgrep 作为全局命令的隐性依赖**
   代码用 `execFile('semgrep', ...)` 直接调 PATH 上的命令，**不指定绝对路径、不检测安装**。本机实测未安装 semgrep（`where semgrep` 无结果），插件会走 `missing` 分支返回友好提示。融合后必须确保运行环境 PATH 里有 semgrep。

---

## 4. 接口暴露

### 4.1 `index.js` 导出的是 **Cordis 插件约定**，不是工具配置对象，也不是 scan 函数

```js
export const name = 'code-scan'        // 插件名
export const inject = ['tools']        // 依赖注入声明
export function apply(ctx) { ... }     // Cordis 生命周期入口
```

- 它**不是**「导出一个 defineTool 配置对象」。`defineTool()` 是在 `apply(ctx)` 运行时才调用，用来构造工具描述，再通过 `ctx.tools.register()` 注册。
- 它**也不是**「导出一个 scan() 函数」。真正的扫描函数在 `scanner.js`。

### 4.2 可独立复用的入口：`lib/scanner.js` 的 `scanDirectory`

```js
// lib/scanner.js 唯一导出
export async function scanDirectory(targetDir, options = {})
```

这是融合时应该直接对接的函数，签名干净、无 DSH 依赖。

### 4.3 实测记录

| 动作 | 结果 |
|---|---|
| `import('.../lib/scanner.js')` | ✅ 成功，导出符号 `['scanDirectory']` |
| `scanDirectory('D:/Dolphin/dsh-code-scan')` | ✅ 返回 `{ ok:false, message:"未检测到 semgrep 命令..." }`（semgrep 未装，走 missing 分支，符合预期） |
| `import('.../index.js')` | ❌ `ERR_MODULE_NOT_FOUND: @deepseek-ai/dsh-tools` |

---

## 5. 融合建议（as-is disclosure）

1. **复用 `scanner.js`，绕开 `index.js`**：直接 `import { scanDirectory }`，这是干净、无 DSH 依赖、已实测可用的入口。
2. **调用方显式传绝对路径**，不要依赖 `process.cwd()` 的隐式解析。
3. **补齐 semgrep 依赖**：目标机器装 semgrep，或把 `runSemgrep` 里的 `'semgrep'` 改成可配置的绝对路径（如环境变量 `SEMGREP_BIN`）。
4. **若需要结构化结果**：当前输出是 Markdown 字符串。要 JSON 的话，建议在融合层加一个「保留原始 results」的选项，因为 `normalizeFindings()` 已经把 semgrep 的丰富字段（代码片段、列号、metadata）丢掉了。
5. **规则集是隐性缺口**：命令没有 `--config`，融合为「主动巡检」场景时，应显式指定规则集（如 `p/default`、`p/owasp-top-ten`、`p/security-audit`），否则巡检内容不可控。

---

*本报告由静态源码阅读 + 真实 Node 加载/调用验证得出，非推测。*
