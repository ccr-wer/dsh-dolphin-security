# 插件 UI 启动排查分析报告（DSH_UI_RECON_REPORT.md）

> 扫描对象：D:\Dolphin（dolphin-patrol.js / dolphin-core.js / dolphin-ssh-core.js / package.json / cordis.patch.yml）
> 对照样本：dsh-web 全家桶中已上线的双面插件 dsh-ssh（@linxin666/dsh-ssh v0.3.6）、纯 UI 插件 dsh-client-ui-skill-explorer，以及纯功能型插件 dsh-code-scan（同为无 UI 形态）
> 日期：2026-09-02

---

## 〇、结论速览

1. **当前项目类型判定**：Dolphin 目前既不是「带 UI 界面的插件」，也**还不是**「纯功能型 DSH 插件」——它是一个**纯 Node 库 + CLI**（本地命令行工具与可编程 API），缺少 DSH/Cordis 插件所需的全部契约层。
2. **"UI 未生成"结论**：成立，且程度比预想更严重——不是「UI 面板没渲染出来」，而是**插件在 dsh 运行时里根本没有挂上任何表面**（无工具、无路由、无设置面板、无 UI 入口）。根因是 `cordis.patch.yml` 声明了插件行，但包内不存在 Cordis 插件契约（`name` / `inject` / `apply`），甚至连插件入口文件（`index.js` / `main` / `exports`）都没有。
3. 造成此现状**不是缺陷而是设计决策**：融合期有意将 Dolphin 做成「零 DSH 依赖」的独立引擎（源码注释可见「移除 cordis / dsh-settings / dsh-tools」）。该决策对「独立 CLI 库」形态完全正确，但与「作为 dsh 插件被加载」的目标冲突——需要补一层适配，而非改核心。

---

## 一、UI 客户端入口缺失排查

### 1.1 `dsh.client` 字段 / `exports["./client"]` 子路径 —— ❌ 全部缺失

生态中带 UI 的插件（以 dsh-ssh 为范本）在 package.json 中必有三件套：

```jsonc
// 生态标准（dsh-ssh / skill-explorer 实际配置）
"main": "lib/index.js",
"exports": {
  ".":        { "types": "./lib/types/index.d.ts", "default": "./lib/index.js" },
  "./client": { "types": "./lib/types/client/index.d.ts", "default": "./lib/client.js" }  // ← 浏览器半区入口
},
"dsh": {
  "engines": { "dsh": ">=0.1.1-rc.1" },
  "bundle":  { "patch": "./cordis.patch.yml" },
  "client": {                                                                    // ← UI 声明
    "inject": ["@deepseek-ai/dsh-client-runtime", "@deepseek-ai/dsh-client-connection",
               "@deepseek-ai/dsh-client-ui-settings"],
    "platform": "web"
  }
}
```

Dolphin 现状（实测 package.json）：

| 标准项 | 生态要求 | Dolphin 现状 |
|---|---|---|
| `main` / 入口解析 | `main: lib/index.js` 或 exports 显式声明 | **无 `main`、无 `exports`**；Node 默认找 `index.js`，**该文件不存在** |
| `exports["./client"]` | 指向浏览器半区 bundle | ❌ 无 |
| `dsh.client` | 声明客户端运行时注入 + platform | ❌ 无（仅 `dsh.bundle.patch`） |
| `dsh.engines.dsh` | 声明兼容的宿主版本下限 | ❌ 无 |

**后果链**：web GUI 依据 `dsh.client` 声明决定是否请求 `/plugins/<id>/client.js`。Dolphin 无此声明 → 前端**从不请求客户端入口 → 没有任何 UI 可以被生成**。

### 1.2 `settings.plugin.item` 槽位注册 —— 生态中无此字面 API

在 dsh-web 全家桶源码中检索 `settings.plugin` / `plugin.item`：**现行生态不使用该字面槽位**。带设置面板的插件（dsh-ssh 为代表）走的是官方 SDK 的两段式 API：

- Host（服务端）半区：`installSettingsSection(ctx, settingsNamespace('dsh-ssh'), Config, config, {...})`（来自 `@deepseek-ai/dsh-settings`），其中 `Config` 是 schemastery schema（`z.object`，字段即配置的 key）
- Client（浏览器）半区：通过 `ctx.settingsScope` 读取同一命名空间（`@deepseek-ai/dsh-client-ui-settings`）

Dolphin 两段均无。若你记忆中「settings.plugin.item + key」来自较早的 DSH 版本或第三方插件实现，建议以官方 `installSettingsSection` 为现行标准重新核对。

### 1.3 UI 注册是否缺 rc.7 之后的 key 字段 —— 本地生态未见字面硬性要求

在 dsh-web 的 dsh-web-settings / dsh-plugin-manager 源码中检索 rc.7 相关注释，得到的是**能力而非注册格式**的差异：rc.7+ 的 apiproxy 直接为宿主提供命名空间服务（`compat-settings-scope.ts` 多处注释），client 侧读取设置的方式随版本演进，但**不存在「注册 UI 组件必须带某 key 字段」的字面约束**。

诚实边界：本地仅为 dsh-web 源码快照，未含 `@deepseek-ai/dsh` 官方的 CHANGELOG 全文；若需 rc.7 精确变更清单，应以 npm 上 `@deepseek-ai/dsh` 的发布说明为准。**但该点不影响本次结论**——Dolphin 缺的是整条 UI 管线，不是某一个 key。

---

## 二、核心逻辑缺失排查

### 2.1 客户端运行时 inject 声明 —— ❌ 缺失

- 生态 host 半区要求：`export const inject = ['webServer', 'tools', 'systemPrompt']`（dsh-ssh/src/index.ts 原文）
- 生态 client 半区要求：`export const inject = ['slots', 'locale', 'settingsScope']`（dsh-ssh/src/client/index.ts 原文），并 import 类型 `@deepseek-ai/dsh-client-runtime/client`、`dsh-client-locale/client`、`dsh-client-ui-settings/client`
- Dolphin：三个核心文件（dolphin-patrol.js / dolphin-core.js / dolphin-ssh-core.js）**零 Cordis 契约导出**——无 `export const name`、无 `inject`、无 `apply`，也无任何 `@deepseek-ai/*` 依赖。

### 2.2 cordis 注入依赖（webServer / tools / systemPrompt）适配 —— ❌ 未适配

生态插件的 `apply(ctx)` 通过 ctx 上的服务挂载表面：

| 表面 | 生态代码（dsh-ssh） | Dolphin 是否有等价物 |
|---|---|---|
| HTTP 路由 | `ctx.webServer.register(route)` + `registerUpgrade` | ❌ 无（dolphin 不走 HTTP） |
| Agent 工具 | `ctx.tools.register(defineTool({ name: 'ssh_exec', ... }))` | ❌ 无（工具层完全未适配） |
| Agent 可发现性 | `ctx.systemPrompt.section({ name:'plugin:dsh-ssh', order:150, text: ... })` | ❌ 无 |
| 设置面板 | `installSettingsSection(ctx, ns, Config, ...)` | ❌ 无 |

**最关键的对照**：生态里与 Dolphin 同形态的**纯功能型插件 dsh-code-scan**（无 UI、无路由）依然具备最小 Cordis 契约（其 index.js 仅 40 行）：

```js
// dsh-code-scan/index.js —— 纯功能型插件的最小可运行范式
export const name = 'code-scan'
export const inject = ['tools']                       // 等 tools 就绪再 apply
export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'code_scan',
    description: '对指定目录运行 semgrep 代码安全扫描，返回…中文报告。',
    parameters: { path: { type: 'string', required: true, description: '…' } },
    output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
    async execute(args, exec) { /* 调 scanDirectory */ },
  }))
}
```

Dolphin 的 `dolphin-patrol.js` 里已有可复用的纯函数（`runPatrol` / `runLocalScan` / `buildRemoteScanCommand` / `scanDirectory`），**但没有任何文件把它们的 name/inject/apply 导出出来**——即「引擎有了，点火钥匙没有」。

---

## 三、当前插件类型判定

**判定：Dolphin 是「纯功能型工具库/CLI」，且尚未达到「纯功能型 DSH 插件」标准。**

三档对照：

| 档位 | 定义 | 是否满足 |
|---|---|---|
| A. 独立 CLI / 库 | 命令行或 import 调用即可用 | ✅ 完全满足（--local / --patrol / test() 均已闭环） |
| B. 纯功能型 DSH 插件 | Cordis 插件 + Agent 工具，无 UI | ❌ 差一层适配（缺 index.js 契约 + dsh-tools 依赖） |
| C. 带 UI 的 DSH 插件 | B + client 半区 + dsh.client 声明 | ❌ 差整套 UI 管线（client 目录 / exports / inject / react） |

**结论：当前项目大概率会存在「UI 未生成」问题 —— 判定成立**，且准确表述是：因缺失 B 档契约层，dsh 运行时根本不会把 dolphin 当作可执行插件挂载；UI（C 档）是在 B 档之上的另一整层，无从谈起。若用户观察到的现象是「dsh web 里看不到 Dolphin 的任何痕迹（无入口、无工具、无设置项）」，根因即本报告第一节与第二节的全部缺失项。

---

## 四、需要补充的配置与代码（按目标档位）

### 4.1 若目标是「纯功能型插件」（推荐第一步，工作量最小）

按 dsh-code-scan 范式，补一个 Cordis 适配层（**不污染现有核心库**，可新建 `index.js` 或 `plugin/index.js`）：

1. **新增插件入口**（约 60~100 行）：
   - `export const name = 'dolphin'`（须与 cordis.patch.yml 的 `id` 一致，当前 patch 里 id 恰为 `dolphin`，对齐）
   - `export const inject = ['tools']`
   - `export function apply(ctx)`：用 `defineTool` 注册两个工具——
     - `dolphin_scan`：包装 `runLocalScan(targetDir)`（本地 semgrep 扫描）
     - `dolphin_patrol`：包装 `runPatrol(alias, targetDir)`（远程 SSH 巡逻），description 中写明「需先在 GUI/配置中登记 SSH 主机别名」
2. **package.json 补**：
   - `"main": "./index.js"`（或 `exports: { ".": "./index.js" }`）
   - `"dsh": { "engines": { "dsh": ">=0.1.0-rc.6" }, ... }`（保留现有 bundle.patch）
   - peerDependencies（或 devDependencies，依宿主约定）：`"@deepseek-ai/dsh-tools": "^0.1.0-rc.6"`、可选 `"@deepseek-ai/cordis": "^4.0.1"`
   - `files` 白名单追加 `index.js`
3. **验证**：`dsh plugin --profile web add dsh-dolphin-security` → `--dump-config` 出现 dolphin 行 → Agent 对话中可直接调用 `dolphin_scan`。

### 4.2 若目标是「带 UI 的插件」（在 4.1 之上追加）

按 dsh-ssh 双面结构补浏览器半区：

1. `package.json`：
   - `exports["./client"]` → `./lib/client.js`（或直接 `./client.js`）
   - `"dsh": { ..., "client": { "inject": ["@deepseek-ai/dsh-client-runtime", "@deepseek-ai/dsh-client-connection", "@deepseek-ai/dsh-client-ui-settings"], "platform": "web" } }`
   - peerDependencies：`react` / `react-dom`（^18.2.0）；devDependencies：全套 `@deepseek-ai/dsh-client-*`（runtime / connection / locale / ui-settings / ui-slots）
2. **client 入口**（`client.js`）：`export const name`、`export const inject = ['slots', 'locale', 'settingsScope']`、`apply(ctx)` 内注册 locale 字典并挂载 UI
3. **UI 表面**：侧边栏入口行 + 中央面板（参照 dsh-ssh 的 `sidebar-entry-core.ts` 共享注入逻辑与 `mount.tsx` 的 DOM/React 双挂载模式；面板单占中央列需处理 `data-pane` 兼容与跨插件激活互斥）
4. **设置面板**：host 侧 `installSettingsSection` + client 侧 `settingsScope` 读取（命名空间建议 `dsh-dolphin-security`）

### 4.3 注意（避免走弯路）

- `cordis.patch.yml` 目前仅 `insert: { id: dolphin, name: dsh-dolphin-security }`，语法正确；但**加载目标包解析不到入口**是当前第一阻塞点，先补 4.1 的 index.js 即可让加载链走通。
- 渲染 / 扫描 / SSH 的核心逻辑保持在 dolphin-*.js 纯函数层（零 DSH 依赖），适配层只做「函数 → 工具 / 设置 / UI」的接线——保持双形态（独立 CLI 与 dsh 插件）长期并存。

---

## 五、依赖遗漏核查

### 5.1 作为 DSH 插件运行所缺的第三方依赖

| 依赖 | 用途 | Dolphin 现状 | 建议 |
|---|---|---|---|
| `@deepseek-ai/dsh-tools` | `defineTool` / `ctx.tools` 类型与注册 | ❌ 无 | peer/dev 依赖，纯功能档必需 |
| `@deepseek-ai/cordis` | `Context` 类型 | ❌ 无（运行时由宿主提供，不必打进 dependencies） | dev 依赖即可 |
| `@deepseek-ai/dsh`（宿主） | 宿主运行时本体 | 不随插件分发（宿主自带） | 无需声明；用 `dsh.engines.dsh` 表达兼容 |
| `@deepseek-ai/dsh-client-runtime` / `-connection` / `-ui-settings` / `-locale` / `-ui-slots` | client 半区运行时与类型 | ❌ 无 | 仅 UI 档需要（dev 依赖） |
| `react` / `react-dom` | client 渲染 | ❌ 无 | 仅 UI 档需要（peer） |
| `ssh2` | SSH 引擎 | ✅ 已有（dependencies ^1.17.0） | 保持不变 |

### 5.2 功能描述是否便于 Agent 调用 —— 建议优化

- 当前 `description` 是「插件宣传语」，适合 README/npm 列表；作为工具描述则过长。
- 参考 dsh-code-scan 的工具级描述风格（一句话 + 何时用），建议在 4.1 的 `defineTool.description` 中写明：
  - `dolphin_scan`：「对本地目录运行 semgrep 静态安全扫描，返回按文件分组的漏洞报告（含行号/严重级别）。当用户提到扫描代码/找漏洞/安全审计时使用。」
  - `dolphin_patrol`：「经 SSH 对远程主机目标目录执行安全巡检。当用户提到远程主机/服务器巡检/批量加固前评估时使用；主机别名需已登记。」
- 若需更强的 Agent 可发现性，可仿 dsh-ssh 在 host 半区注册一段 `ctx.systemPrompt.section`（中文宣告插件能力与边界），这是生态里让 Agent「知道有这个插件」的官方通道。

---

## 六、结论与建议路线

1. **UI 未生成的根因 = 插件整体未被 Cordis 挂载**（无入口文件 + 无 name/inject/apply + 无 dsh.client 声明），而非 UI 组件本身写错。
2. **类型判定**：当前为「纯 Node 库/CLI」；距「纯功能型 DSH 插件」差一个适配层，距「带 UI 插件」差整条 client 管线。
3. **建议顺序**：先落地 4.1（index.js + dsh-tools，半日工作量）让插件在 dsh 中「可用」；视使用反馈再决定是否投入 4.2 的 GUI（侧边栏面板 + 设置页）。
4. 若只是排查「为什么没有 UI」，本报告已回答：**不是缺 key，而是缺整条 UI 声明与加载链路**；与其追 rc.7 的字段细节，不如按 dsh-ssh / dsh-code-scan 的现行范式补齐契约层。
