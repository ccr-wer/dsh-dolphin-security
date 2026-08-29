# Agent Note: 修复虎鲸链路 (orca-link) 输入框绑定赋值作用域缺陷

Status: implemented

## Problem

当启用「虎鲸链路 (orca-link)」皮肤时，打开设置面板会被浮动在前景的对话输入框（composer card）等元素完全遮挡（Issue #1200、Small-tailqwq/dsh-deep-whale#85）。故障根因是 `packages/skins/skin-center/skins/orca-link/hooks.mjs` 中的一处 JavaScript 作用域缺陷：`mountBinding` 将 `binding` 声明为 `const binding = bindings.get(seat)`，在首次挂载 `binding` 为 `undefined` 时，将新创建的对象直接存入 `bindings.set(seat, created)`，却未将其赋回给局部变量 `binding`。随后的 `binding.handles` 属性访问抛出 `TypeError`，导致皮肤控制器的安全兜底机制捕获异常（输出 `hooks failed for orca-link; static skin stays active`）并中断了 `apply(ctx)` 后续逻辑。这导致 `settingsOverlayDisposer` 未能注册，打开设置面板时 `body[data-orca-settings-open]` 无法置位，设置面板无法被提升层级，因而被前景的输入框与浮动组件遮挡。

## Decision

修复 `packages/skins/skin-center/skins/orca-link/hooks.mjs` 中的 `mountBinding`：将变量声明改为 `let binding` 并将新创建的绑定对象直接赋值给局部变量，确保后续手柄挂载与状态检查正常执行。DOM 构造函数（`Element`、`HTMLElement`、`SVGElement`、`HTMLInputElement` 等）安全回退至当前激活的 `window` / `document.defaultView`。在 `packages/skins/skin-center/tests/orca-link-hooks.spec.ts` 中补充回归测试，断言包含会话流的输入框挂载手柄时不抛出异常，并验证设置弹窗挂载时 `body[data-orca-settings-open]` 正常同步。同步更新 reviewed hooks 注册表与 market 构建产物。

## Alternatives considered

仅依靠纯 CSS 规则而不依赖 `data-orca-settings-open` 来提升模态层级的方案被否决，因为虎鲸链路皮肤需要在打开设置时动态压制和隐藏背景装饰与前景浮动元件（脊柱背景、待机指示、状态角色气泡及输入框停靠等）。在 `mountBinding` 内部静默捕获异常而不修正赋值的方案被否决，因为这会导致输入框拖拽手柄缺失并破坏折叠交互功能。

## Consequences

虎鲸链路皮肤在初次加载和会话切换时 hooks 正常执行，无运行时异常。打开设置面板时，`body[data-orca-settings-open]` 正常置位，`patches.css` 正确提升设置模态层级并压制遮挡元素。皮肤控制器的崩溃报错消失，各项动态交互特性保持正常运行。
