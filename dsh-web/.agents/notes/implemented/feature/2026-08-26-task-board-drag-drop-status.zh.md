# Agent Note: 任务看板卡片拖拽变更状态支持

状态：已实现 (implemented)

## 问题背景

在任务看板多列视图中，此前在不同状态列（Backlog 待规划 与 Todo 待办）之间移动卡片的唯一途径是点击卡片打开任务详情面板，再点击状态移动按钮。用户希望能在看板上直接通过拖拽完成手动状态列的流转（#1195）。

## 技术决策

1. 在 `packages/dsh-task-board/src/client/board/TaskCard.tsx` 中，对非归档、非运行中且非执行等待中的卡片启用原生拖拽（`draggable={!archived && task.status !== 'running' && !pending}`），并在 `onDragStart` 中设置任务 ID；
2. 在 `packages/dsh-task-board/src/client/board/TaskBoard.tsx` 中，为手动目标状态列（`backlog` 与 `todo`）添加 `onDragOver` 与 `onDrop` 事件处理，复用 `canMoveManually` 安全校验，并在放置时触发 `controller.moveTask`；
3. 在 `packages/dsh-task-board/tests/board-view.spec.tsx` 中补充了针对卡片可拖拽属性、跨列拖拽触发 `moveTask` 以及非法拖拽拦截的完备单元测试。

## 影响与收益

用户可以在看板页面直接拖拽卡片在「待规划」与「待办」列之间快速切换状态；运行中、执行等待及归档任务继续受安全规则保护，不可非法拖拽。

## 验证结论

`pnpm --filter @linxin666/dsh-client-ui-task-board test`（235 项测试全通过）、全仓 `pnpm typecheck` 与 `pnpm test` 全绿。
