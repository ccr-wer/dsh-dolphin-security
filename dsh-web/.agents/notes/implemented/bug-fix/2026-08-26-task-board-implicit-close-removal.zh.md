# Agent Note: 任务看板隐式关闭移除

状态：已实现 (implemented)

## 问题背景

`BoardController.onSessionsChanged()` 在会话列表 `current` 选中于两个有效 id 之间变化时就关闭看板。但会话列表通知的触发原因远不止用户导航：Host runner 启动任务执行时会新建独立 DSH 会话且 Web 客户端会选中它、后台导航与执行结算都会触碰选中项、其他插件也会改动列表。看板打开时，每一次这类变动都会把看板顶掉、把视图拽回会话页——用户在毫无操作的情况下被拉离看板。0.1.x 版本的插件正是基于这一原因从不隐式关闭看板；该行为在 0.3.x Host 账本重写时回归，并延续过了 #1182 的瞬态空值加固（有效 id 间变化即关闭的分支被保留）。

## 技术决策

1. `packages/dsh-task-board/src/core/controller.ts` 中，`onSessionsChanged()` 刻意置为空实现：看板不再因任何会话列表变动而隐式关闭。
2. `lastCurrent` 基准字段、`openBoard()` 中对它的初始化，以及 `currentOf()` 辅助函数随其服务的机制一并移除。
3. 看板仅因用户显式操作关闭：点击侧栏会话/工作区/搜索行（`board-mount` 的 `onClickSidebarRow` 捕获监听）、看板自身的 `openSession()`（跳转执行记录）以及关闭入口本身。
4. `packages/dsh-task-board/tests/controller.spec.ts` 的测试重写为断言看板在选中变化下保持打开（#1182 的瞬态空值场景仍被覆盖）。

部分取代 [任务看板会话瞬态抖动导航保护](2026-08-26-task-board-navigation-jitter.zh.md)：瞬态空值保护的决策理由由本文继承；其描述的 `lastCurrent` 机制已移除。

## 备选方案

- 保留"导航即关闭"但区分用户点击与程序性选中变化。否决：浏览器半区唯一可用的信号就是会话列表快照，它不携带 `current` 变化的原因归属；任何启发式（时序、焦点）都是猜测，会重新打开同一类 bug。
- 只在看板自身来源（openSession）与侧栏行点击时关闭，完全去掉订阅。否决：保留（空的）钩子以零成本维持订阅与 dispose 契约，供未来监听者使用。

## 影响与收益

- Host runner 创建并选中执行会话时看板保持打开——观察定时任务触发不再被顶出看板视图。
- 用户若通过侧栏行点击或看板动作以外的方式切换会话（例如 GUI 其他位置的快捷键），看板保持打开；侧栏行点击路径仍是标准的"导航即关闭"。
- `openSession()` 行为不变：跳转到执行记录的会话页仍按设计关闭看板。

## 验证结论

`pnpm --filter @linxin666/dsh-client-ui-task-board typecheck`、`pnpm --filter @linxin666/dsh-client-ui-task-board test`（232 通过、1 跳过）、`pnpm --filter @linxin666/dsh-client-ui-task-board build` 与 `pnpm docs:check` 全部通过。
