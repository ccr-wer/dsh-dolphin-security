# 语义属性 v1 枚举实地调研快照（issue #506，2026-08-18）

> 一次性调研快照归档。权威枚举表在 packages/skins/skin-center/contracts/semantic-attrs-v1.md；
> 本文件保留调研证据与行号。调研范围：官方 SDK rc.7 构建产物 + packages/ 下 8 个功能插件包客户端源码（只读）。

## 1. 官方 shell DOM 关键发现

### 1.1 slot outlet 自带 data-slot 属性（最重要）

官方 React slot 渲染器给每一个 slot 出口包一层 `<div data-slot="<slot键名>" style="display:contents">`：

- dsh-client-web-react/lib/index.js:606-615：ANCHOR_STYLE = { display: "contents" }；SlotOutlet 返回 jsx("div", { "data-slot": slotKey, style: ANCHOR_STYLE })。
- 同文件 :725-727：root 出口 data-slot="root"。错误兜底 data-slot-error（:395、:659、:722）。
- 构建 bundle 二次确认：dsh-web-frontend/dist/assets/index-C-1AiF3k.js。

含义：官方 shell 已有稳定、语义化、带区域名的 DOM 锚点，display:contents 不参与布局。

### 1.2 Slot 键清单（按区域）

- 应用根 root（dsh-client-ui-slots/lib/types/index.d.ts:501-503）
- 左栏 sidebar / 中栏 conversation / 右栏 details / 全局浮层 shell.overlay（dsh-client-ui-layout/lib/types/client/index.d.ts:31-80）
- sidebar.workspaces / sidebar.settings / sidebar.footer.action（dsh-client-ui-sidebar slots.d.ts:20-43）
- conversation.session / .session.header / .session.header.actions / .utilities / .view / .chat.node / .chat.commandview / .chat.turnTail / .chat.assistant-actions / .details.tool / .composer / .composer.bar / .input.dock / .composer.dock / .input.left / .input.right / .input.plan / .input.model / .hero.workspace / .hero.agentPreset（dsh-client-ui-conversation slots.d.ts:32-274）
- settings.trigger / .header / .action / .close / .section / .plugins.tab / .general.item / .onboarding（dsh-client-ui-settings slots.d.ts:21-114）
- tool.call.toolview / tool.view.cordis

### 1.3 布局帧与消息行锚点

- 三列容器只有 CSS-module hash 类（AppFrame sidebarCol/centerCol/detailsCol/frame/overlayLayer，dsh-client-ui-layout/lib/client.js:90-235），跨构建不稳定。
- 帧级稳定属性：data-sidebar-collapsed / data-details-collapsed / data-dragging（:222-224）、data-shell-overlay（:236）、拖拽手柄 data-side（:150）。
- data-ds-dark-theme 打在 document.body（:345,370）。
- 消息行：div[data-chat-anchor-key][data-chat-flow-key][data-chat-flow-kind]（dsh-client-ui-conversation/lib/client.js:5265-5269）；滚动口 data-conversation-scroll（:5283）；assistant markdown 根 data-streaming（:9114）；turn 尾 data-turn-tail（:9336）；排队 dock data-queue-dock（:6430）；ConversationRoot data-phase（:6942）；textarea data-phase（:3839）；装饰 chip data-decoration="chip|token|text-ref|hint"（:3713-3761）。
- 设置面板只有 role="dialog"（dsh-client-ui-settings-general/lib/client.js:122）。
- keyed/list slot 的单 entry 没有独立 wrapper（web-react/lib/index.js:713），data-slot 只到出口级。
- 既有先例：packages/dsh-web-ui-all/src/client/index.ts:20-25 COLUMN_SHIMS 用 [class*="sidebarCol"] 子串匹配给三列补打 data-pane="sidebar|conversation|details" 并给帧打 data-dsh-frame（:49-54），MutationObserver + rAF 合帧重打（:60-75）。v1 适配器是它的正规化。

## 2. 插件 DOM 归属（8 个功能插件）

| 插件 | 挂载点 | 根节点现有标识 | 建议 data-dsh-plugin |
| --- | --- | --- | --- |
| dsh-task-board | 中栏接管面板（board-mount.tsx:23,50-55）+ 侧栏入口行（sidebar-entry-core.ts:86-108）+ 设置卡 web-ui.plugin.item id task-board | [data-dsh-taskboard-view] / [data-dsh-taskboard-board]（TaskBoard.tsx:53）/ [data-dsh-taskboard-entry] / html[data-dsh-taskboard-active] | task-board |
| dsh-ssh | 同构（mount.tsx:23,56-63） | [data-dsh-ssh-view] / [data-dsh-ssh-entry] / html[data-dsh-ssh-active] / style[data-dsh-ssh-xterm] | ssh |
| dsh-git-graph | 纯 slot：conversation.input.selector.context 或兜底 input.dock，entry id git-graph | [data-gitgraph-chip-anchor]（BranchChip.tsx:251）/ [data-gitgraph-dialog]（GraphDialog.tsx:106） | git-graph |
| dsh-pet | 全局浮层 createRoot 挂 body（index.ts:293-297）+ settings.section id pet | [data-dsh-pet-root] / [data-pet-dock] / [data-testid="pet-summon"] | pet |
| dsh-remote-web-ui | sidebar.footer.action id remote-web-ui + 配对对话框 portal + 设置卡 + 一次性 toast + 独立手机端 DOM 树 | 无自有 data 属性，slot entry id 是唯一稳定身份 | remote-web-ui |
| dsh-web-ui-settings | settings.section id web-ui-plugins order 110，声明子 slot web-ui.plugin.item | 无 data 属性 | web-ui-settings |
| dsh-community-plugins | settings.section id community-plugins order 140 | 无 data 属性 | community-plugins |
| dsh-aionui-panel（停更） | 两个 conversation.input.dock entry + 设置卡 | 无自有 data 属性 | aionui-panel |

skin-center 自身：settings.section 一级页（src/client/index.ts:135-136），若纳入 plugin 组值为 skin-center。

## 3. 部件（part）候选明细

（权威枚举见 contracts/semantic-attrs-v1.md；此处保留各部件的现有锚点行号。）

- task-board：header（TaskBoard.tsx:54 header 标签）、column（section[data-status] :110,126）、column-header（:111,127）、card（TaskCard.tsx:48-50 [data-status][data-pending]）、card-run（:69 [data-result]）、detail、modal、sidebar-entry。
- ssh：tab-bar（SshPanel.tsx:69 [role=tablist]）、tab（:71 [role=tab][data-active]）、panel-header（:57）、host-table（HostsTab.tsx:177 table）、host-row（:149-169 tr，[data-kind] 徽标、[data-danger] 按钮）、terminal（TerminalTab.tsx:176 termContainer，.xterm 辅锚）、banner（[data-kind=ok|error|info]）、sidebar-entry。
- git-graph：chip、dialog、graph-row（GraphDialog.tsx:137 hash 类）、lanes（:138 [data-gitgraph-lanes]）、glyph（:142）、ref（:162-163 [data-gitgraph-ref-current]）。
- pet：root、dock、summon-button、sprite（PetSprite.tsx:309,337 hash 类）、bubble（:360,425）、panel（:437-438 [data-placement]）。
- web-ui-settings：section（WebUIPluginsCard.tsx:22）、subcard-list（:25 ul）、plugin-item（slot 出口内 entry）。
- community-plugins：market/toolbar/grid/marketplace-card（CommunityPluginsCard.tsx:211-262，均 hash 类）。
- shell 侧：message-row / message-body / scrollport / composer-input / composer-chip / queue-dock / turn-tail / resize-handle / sidebar-entry。

## 4. 风险段（无稳定锚点清单）与上游诉求

1. AppFrame 三列容器本体只有 hash 类；现有 shim 与子串匹配脆弱（[class*="centerCol"]）；slot 出口 display:contents 不参与布局，列级样式缺钩子。→ 上游诉求 #1：三列自带稳定 data 钩子。
2. 侧栏内部结构全 hash 类，插件入口行靠 button[class*="newSession"] 定位注入（sidebar-entry-core.ts:52-63,84）。→ 上游诉求 #2：sidebar 导航 list slot。
3. 设置模态只有 role="dialog"，与 git-graph GraphDialog 等撞车。→ 上游诉求 #3：设置 dialog 根专属标识。
4. list slot 单 entry 无 DOM 归属标识。→ 上游诉求 #4：slot entry 渲染透传 entry id 到 DOM（data-dsh-plugin 归属的最干净来源）。
5. composer 内部常驻 chrome 无 data 锚，v1 可接受。
6. 官方 data-plugin 已占用（style 标签归属，dsh-client-modules/lib/client.js:31-38 / dsh-client-hmr/lib/client.js:26-28），v1 用 data-dsh-plugin 区分。
7. body 级属性拥挤（data-ds-dark-theme / *-active / 皮肤 bodyAttr），不属于 surface/part/plugin 三组。
8. remote-web-ui 手机端是独立 DOM 树，v1 不纳入。
