# Agent Note: Pre-execution task content editing

Status: implemented

## Problem

The task board showed task content after creation but offered no way to correct a title, description or execution prompt before the first run. A client-side edit affordance alone would also allow stale clients to change the content of a task whose execution had already started.

## Decision

The task detail view provides an Edit action for title, description and execution prompt only while a task is on the board, is not running and has no execution records. The edit modal is prefilled, trims content through the existing update use case and closes only after the Host confirms the update. The Host ledger repeats the rule: content patches for running, settled or cancelled-before-launch tasks fail closed, while workspace, mode and permission targets retain their existing future-run editing behavior. Archived tasks remain read-only.

## Alternatives considered

- Gate editing only in the browser: rejected because a stale or concurrent client could still submit a content patch after execution began; the Host ledger is the authority and must enforce the invariant.

- Make all task fields read-only after the first execution: rejected because execution targets describe future runs and existing behavior allows those targets to be changed on non-archived tasks.

- Allow editing after a cancelled execution: rejected because the execution record is already a durable record of a launch attempt; content must remain an accurate record of what was planned for that attempt.

- Add a separate edit route instead of a modal: rejected because task detail is already the single mutation surface and the modal keeps the board selection, validation and Host error visible without adding navigation state.

## Consequences

- Users can correct task content before execution without recreating a task.
- The update protocol remains additive: content fields use the existing update action, while Host rejection protects executed history from stale clients.
- BoardController.updateTask is asynchronous when Host-backed and returns whether the authority accepted the patch; legacy in-memory callers retain synchronous state application before the resolved result.
- The edit UI reuses task-board form styling and locale keys; no new stylesheet contract is introduced.

## Testing

The task-board package typecheck, test suite and build pass. Focused coverage exercises content normalization, editability across fresh/running/settled/cancelled/archived states, Host rejection and target-field preservation, protocol parsing, and the jsdom edit modal flow.
