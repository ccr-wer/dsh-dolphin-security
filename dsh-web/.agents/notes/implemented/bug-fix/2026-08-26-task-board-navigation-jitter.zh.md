# Agent Note: 任务看板会话瞬态抖动导航保护

状态：已实现 (implemented)

## 问题背景

在打开任务看板时，`openBoard()` 会将当前选中的会话 ID 记录在 `lastCurrent`。在组件挂载、会话列表重新渲染或子代理链变动时，会话列表快照会瞬时发出 `current = undefined`。控制器内部的 `onSessionsChanged()` 简单通过 `current !== this.lastCurrent` 判定，将瞬态空值误判为用户切走会话，导致任务看板刚打开就立即被关闭回到聊天界面。

## 技术决策

1. 在 `packages/dsh-task-board/src/core/controller.ts` 中，优化 `onSessionsChanged()`：只有当 `this.lastCurrent` 与新 `current` 均为明确的有效字符串且两者不同时（`this.lastCurrent !== undefined && current !== undefined && current !== this.lastCurrent`），才触发 `this.closeBoard()`。
2. 若 `current` 瞬态为 `undefined`，保持看板开启不关闭；若 `this.lastCurrent` 初始为 `undefined`，则将首次出现的有效 `current` 记录为基准。
3. 在 `packages/dsh-task-board/tests/controller.spec.ts` 中补充了瞬态空值抖动与未选会话打开的回归测试。

本 note 于同日被 [任务看板隐式关闭移除](2026-08-26-task-board-implicit-close-removal.zh.md) 部分取代：本文描述的 `lastCurrent` 基准机制已被移除，看板自此不再因任何会话列表变动而隐式关闭。瞬态空值保护的决策理由由后继 note 继承。

## 影响与收益

任务看板点击后稳定停留，彻底消除会话列表瞬态抖动引起的闪退。"用户真正切换会话时依然能正确关闭看板"这一结论已随实现变化：自后继 note 起，会话列表层面的选中变化同样不关闭看板，看板仅因用户显式操作关闭（侧栏会话/工作区行点击、看板自身的 openSession 与关闭）。

## 验证结论

`pnpm --filter @linxin666/dsh-client-ui-task-board test`（232 项测试通过）、全仓 `pnpm typecheck` 与 `pnpm test` 全绿。
