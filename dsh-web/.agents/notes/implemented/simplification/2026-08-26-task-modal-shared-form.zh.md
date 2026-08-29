# Agent Note: 共享任务弹窗外壳与内容字段

Status: implemented

## Problem

dsh-task-board 的 NewTaskModal 与 EditTaskModal 逐字重复了弹窗外壳（背景层、表单、标题、错误段落、取消/提交页脚——约 30 行）与标题/描述/prompt 字段三件套（约 45 行）；每次改动都要改两处，重复代码审计给出了两个文件的具体位置。

## Decision

`src/client/board/TaskForm.tsx` 现在导出 `ModalShell`（遮罩 + 表单 + 错误 + 页脚，经 props 受控）与 `TaskContentFields`（三个共享字段的受控输入）。两个弹窗保留各自的状态、提交逻辑，以及仅新建才有的区块（workspace/mode/permission/schedule）；编辑弹窗刻意更窄的表面保持不变。

## Alternatives considered

合并为带 mode prop 的单一弹窗被否决：两条流程在校验、提交路径与字段集上不同（编辑刻意不能改 workspace/mode/permission/schedule），单组件会累积比重复更糟的条件分支。只抽字段不抽外壳被否决，属于半截方案——页脚/错误/背景层一块才是更易出错的一半（焦点、提交、pending 状态）。

## Consequences

弹窗结构改动现在只落一个文件。渲染 DOM（元素、类名、aria 标签、顺序）与此前逐字节一致，因此无视觉变化、无需截图证据；既有 DOM 级规格（task-detail-edit.spec.tsx、board-view.spec.tsx）验证了结构。

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board typecheck`、`test`（237 项全过）与 `build`——全部通过。
