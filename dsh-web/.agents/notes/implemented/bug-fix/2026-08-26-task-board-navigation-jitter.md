# Agent Note: Task Board Session Jitter Navigation Protection

Status: implemented

## Problem

When the task board was opened, `openBoard()` baseline-recorded the current session id in `lastCurrent`. During session list re-renders, subagent chain initializations, or view mounts, the session list snapshot momentarily emitted `current = undefined`. The controller's `onSessionsChanged()` checked `current !== this.lastCurrent` and immediately called `this.closeBoard()`, closing the task board on click.

## Decision

1. In `packages/dsh-task-board/src/core/controller.ts`, updated `onSessionsChanged()` to only call `this.closeBoard()` when navigating between two valid and distinct session ids (`this.lastCurrent !== undefined && current !== undefined && current !== this.lastCurrent`).
2. If `current` is momentarily `undefined`, the board stays open; if `this.lastCurrent` was undefined when the board opened, it records the first valid session id without closing.
3. Added unit tests in `packages/dsh-task-board/tests/controller.spec.ts` covering transient undefined blips and baseline initializations.

Partially superseded the same day by [task-board implicit close removal](2026-08-26-task-board-implicit-close-removal.md): the `lastCurrent` baseline mechanism this note describes was removed, and the board now never closes implicitly on session-list churn of any kind. The undefined-blip protection rationale lives on in the successor note.

## Consequences

The task board stayed open through transient session-list undefined blips. The "still closes when the user explicitly switches sessions" consequence no longer holds as shipped: since the successor note, explicit switches observed through the session list also leave the board open, and the board closes only on explicit user actions (sidebar session/workspace row click, the board's own openSession and close).

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board test` (232 passed), `pnpm typecheck`, and `pnpm test`.
