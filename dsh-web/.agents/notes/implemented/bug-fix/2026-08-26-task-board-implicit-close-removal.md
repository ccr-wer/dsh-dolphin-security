# Agent Note: Task Board Implicit Close Removal

Status: implemented

## Problem

`BoardController.onSessionsChanged()` closed the board whenever the session-list `current` selection changed between two valid ids. But session-list notifications fire for all kinds of incidental churn, not just user navigation: when the Host runner starts a task execution it creates a fresh DSH session and the web client selects it, background navigation and settlement touch the selection, and other plugins mutate the list. With the board open, every such churn evicted the board and yanked the view back to the conversation — the user was pulled off the kanban without asking. The 0.1.x line of this plugin never closed the board implicitly for exactly this reason; the behavior regressed in the 0.3.x Host-ledger rewrite and survived the #1182 undefined-jitter hardening, which kept the close-on-valid-change branch.

## Decision

1. In `packages/dsh-task-board/src/core/controller.ts`, `onSessionsChanged()` is now intentionally empty: the board never closes implicitly on session-list churn of any kind.
2. The `lastCurrent` baseline field, its initialization in `openBoard()`, and the `currentOf()` helper were removed together with the mechanism they served.
3. The board closes only on explicit user actions: clicking a sidebar session/workspace/search row (`board-mount` `onClickSidebarRow` capture listener), the board's own `openSession()` (jump to transcript), and the close affordances themselves.
4. Tests in `packages/dsh-task-board/tests/controller.spec.ts` were rewritten to assert the board stays open across selection changes (including the #1182 undefined-blip scenarios, which remain covered).

Partially supersedes [task-board session jitter navigation protection](2026-08-26-task-board-navigation-jitter.md): the undefined-blip protection rationale is inherited here; the `lastCurrent` mechanism it described is gone.

## Alternatives considered

- Keep the close-on-navigation behavior but distinguish user clicks from programmatic selection changes. Rejected: the session-list snapshot is the only signal available in the browser half, and it carries no provenance for why `current` changed; any heuristic (timing, focus) remains guesswork and reopens the same bug class.
- Close only when the board itself is the origin (openSession) and on sidebar row clicks, dropping the subscription entirely. Rejected: keeping the (empty) hook preserves the subscription and dispose contract for future listeners at zero cost.

## Consequences

- The board stays open while the Host runner creates and selects execution sessions — watching a scheduled task fire no longer evicts the kanban view.
- A user who switches sessions through a means other than a sidebar row click or a board action (for example a keyboard shortcut elsewhere in the GUI) keeps the board open; the sidebar row click path remains the canonical close-on-navigate.
- `openSession()` behavior is unchanged: jumping to an execution transcript still closes the board by design.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board typecheck`, `pnpm --filter @linxin666/dsh-client-ui-task-board test` (232 passed, 1 skipped), `pnpm --filter @linxin666/dsh-client-ui-task-board build`, and `pnpm docs:check` all pass.
