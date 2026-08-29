# Agent Note: 工作区选择视口滚动锁定与 Root 盒模型修正

状态：已实现 (implemented)

## 问题背景

在 DSH Web UI 中选择或切换工作区（例如点击输入框上方的 `@ Workspace write` 选择工作区）时，页面视口出现异常向下滚动。顶部标题栏与侧栏顶部被推至视口上方（小于 y=0），`#root` 的底部边框停留于视口中央（约 45% 高度处），底部露出大片空白黑色区域并伴随全局窗口滚动条。其根因为 `html` 与 `body` 未锁定 `overflow: hidden`，且如 `matrix` 等皮肤在 `[id="root"]` 上添加 `border: 1px solid` 时未声明 `box-sizing: border-box`，造成 `body` 内容微小溢出；在选择工作区后浏览器原生 `focus()` / `scrollIntoView()` 将父级视口滚动到底部。

## 技术决策

1. 在 `packages/skins/skin-center/src/client/runtime/shell-rendering.ts` 中：
   - 针对当前激活的视觉模式添加规则，将 `html, body` 强制锁定为 `height: 100% !important; width: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important;`。
   - 将 `[id="root"]` 强制锁定为 `box-sizing: border-box !important; height: 100% !important; width: 100% !important; max-height: 100% !important; overflow: hidden !important;`。
   - 在 `installShellRenderingAdapter()` 安装适配器时调用 `doc.defaultView?.scrollTo?.(0, 0)`，在挂载时复位任何残留的视口偏移。
2. 在 `packages/skins/skin-center/skins/matrix/patches.css` 与 `minecraft/patches.css` 中为 `[id="root"]` 补充 `box-sizing: border-box; height: 100%;`。
3. 在 `packages/skins/skin-center/tests/skin-runtime.spec.ts` 中补充了单元测试，验证视口约束规则与盒模型锁定。

## 影响与收益

页面严格保持 100% 视口且无外部全局滚动条，在切换或选择工作区时彻底消除页面整体下坠与偏移问题。

## 验证结论

`pnpm --filter @linxin666/dsh-client-ui-skin-center test`（567 项测试全部通过）、`pnpm skin-center:check`、`node scripts/market-build`、`pnpm market:check`、`pnpm docs:check`、`pnpm aggregate:check` 以及 `pnpm typecheck` 全部通过。
