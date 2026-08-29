# Agent Note: Shared task-modal shell and content fields

Status: implemented

## Problem

NewTaskModal and EditTaskModal in dsh-task-board duplicated the modal shell (backdrop, form, title heading, error paragraph, cancel/submit footer — ~30 lines) and the title/description/prompt field trio (~45 lines) verbatim; a copy had to be edited twice per change, which the duplication audit flagged with both file locations.

## Decision

`src/client/board/TaskForm.tsx` now exports `ModalShell` (overlay + form + error + footer, controlled via props) and `TaskContentFields` (the three shared fields as controlled inputs). Both modals keep their own state, submit logic, and the new-only sections (workspace/mode/permission/schedule) in place; the edit modal's deliberately narrower surface is unchanged.

## Alternatives considered

A single unified modal with a mode prop was rejected: the two flows differ in validation, submit path, and field set (edit intentionally cannot change workspace/mode/permission/schedule), so one component would accumulate conditional branches worse than the duplication. Extracting only the fields without the shell was rejected as half-measure — the footer/error/backdrop block is the more error-prone half (focus, submit, pending states).

## Consequences

Modal markup changes now land in one file. Rendered DOM (elements, classes, aria labels, order) is byte-identical to before, so no visual change and no screenshot evidence is owed; the existing DOM-level specs (task-detail-edit.spec.tsx, board-view.spec.tsx) verify the structure.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board typecheck`, `test` (237 pass), and `build` — all green.
