# Agent Note: History-head probe memo for wedged execution inspection

Status: implemented

## Problem

`HostExecutionRunner.inspect` pages backward through session history (up to 100 pages of 100 events) to find the execution's `turn/end`. When no matching `turn/end` exists (adapter mismatch, odd host state), the complete scan misses, returns `pending`, and the 5-second poll tick re-pulls and re-parses the entire history for that execution forever — sustained host CPU and bandwidth proportional to session size, multiplying per wedged execution. A read-only audit flagged the loop with concrete file and line evidence.

## Decision

Before paging, `inspect` now fetches a one-message probe (`maxMessages: 1`, the newest page) and compares its head seq against a per-session memo of the last head whose complete scan missed. An unchanged head proves no event was appended, so the outcome cannot change and the deep scan is skipped. The memo is written only after a scan that reached the execution boundary without finding `turn/end`, and dropped when the session is running, settles, or vanishes. `SessionSummary.updatedAt` was ruled out as the change signal: per its contract it tracks the latest human-authored prompt, not event appends, so memoizing on it could permanently miss a late-flushed `turn/end`.

## Alternatives considered

Memoizing on `updatedAt` was rejected for correctness (above). A consecutive-pending counter with a hard give-up was rejected: a wedged execution may still legitimately settle when its turn/end flushes late, and silently settling it would corrupt the ledger. Building a sessionId-keyed Map per tick instead of `items.find` per execution was rejected as unmeasured micro-optimization — session lists are small and the find runs once per open execution per tick. Deduplicating the probe page with the first scan page was rejected for clarity: the probe costs one tiny RPC and only runs when a scan might start.

## Consequences

A wedged execution now costs one one-message history RPC per 5-second tick instead of up to 100 page fetches; executions with in-flight history keep scanning on every tick (memo only forms after a complete miss), and any new event bumps the head seq and triggers exactly one fresh full scan. The probe adds one extra RPC on the success path (probe + scan instead of scan), visible in the updated call-count assertions. No behavior change for settle timing or outcomes.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board typecheck`, `test` (237 pass) and `build`. New host-runner cases pin the probe-then-skip contract: second tick with an unchanged head costs exactly one probe call, a bumped head forces a full rescan, and settling/vanishing sessions drop the memo.
