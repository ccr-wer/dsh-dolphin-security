# Agent Note: Task Board Card Drag and Drop Status Changes

Status: implemented

## Problem

In the task board kanban view, moving a task between status columns (Backlog and Todo) required opening the task detail panel and clicking the status move button. Users requested direct drag-and-drop capability between columns on the board (#1195).

## Decision

1. In `packages/dsh-task-board/src/client/board/TaskCard.tsx`, made cards draggable when they are non-archived, non-running, and non-pending (`!archived && task.status !== 'running' && !pending`), setting the task ID in `dataTransfer`.
2. In `packages/dsh-task-board/src/client/board/TaskBoard.tsx`, added `onDragOver` and `onDrop` handlers to manual status columns (`backlog` and `todo`), validating drop eligibility with `canMoveManually` and invoking `controller.moveTask`.
3. Added comprehensive automated tests in `packages/dsh-task-board/tests/board-view.spec.tsx` testing draggable states and valid/invalid drag-and-drop moves.

## Consequences

Users can smoothly drag tasks between Backlog and Todo columns directly on the board. Running, failed, done, and pending execution states continue to be safely governed by execution guards and cannot be illegally dragged.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board test` (235 passed), `pnpm typecheck`, and `pnpm test`.
