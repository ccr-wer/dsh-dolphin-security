# Agent Note: Batched live-event folding in mobile ChatView

Status: implemented

## Problem

The mobile ChatView folded every incoming mux event individually (`folder.fold([event])` per event inside a `setMessages` updater). Each fold that applies an event rebuilds the snapshot as a fresh O(messages) array copy, so live streaming cost O(events × messages): at 8,000 rendered messages and a 2,000-chunk turn, a benchmark over the real `EventFolder` measured ~24 ms of pure fold work per turn on a desktop CPU (median of 5 runs), growing quadratically with history depth — plus one React state update per event. A read-only audit flagged the same path from code inspection.

## Decision

ChatView now buffers live events and folds each burst as one batch: chunk events (`assistant/chunk` / `message/chunk`) wait for a 50 ms flush timer (`FOLD_FLUSH_MS`, exported), while every other event type (final assistant message, turn/end, user echo, update/delete) flushes the buffer synchronously so settled UI states — including the byte-exact final render pinned by ChatView.stream.test.tsx — never wait for the cadence. The mux effect cleanup cancels a pending flush and drops the buffer, since buffered events belong to the session being torn down. `EventFolder` itself is unchanged; its doc comment now states the real cost contract (one snapshot copy per applied batch, amortized by consumer-side batching) instead of claiming O(1) per event.

## Alternatives considered

An id-to-index map inside FoldState (removing the O(messages) identity scan in replaceMessage/removeMessage) was implemented, benchmarked, and rejected: at M=8,000/E=2,000 the Map maintenance made both the per-event path (~26.8 ms vs ~24.0 ms baseline) and the batched path (~8.9 ms vs ~6.9 ms) slower — the pointer-identity scan is cheaper than Map set/delete churn at realistic sizes. A turn-to-messages reverse index for applyTurnEnd was rejected on cost grounds without implementation: turn/end fires once per turn, so an O(messages) filter there is microseconds. requestAnimationFrame batching was rejected: rAF pauses in background tabs, letting the buffer grow unbounded during hidden streaming; a timer works everywhere.

## Consequences

Streaming chunks reach the DOM up to 50 ms later than before (imperceptible next to the existing STREAM_RENDER_INTERVAL_MS markdown throttle); all non-chunk events render immediately as before. Fold work per turn drops ~3.5x (24.0 → 6.9 ms median at M=8,000/E=2,000, desktop Node; phone CPUs amplify the absolute win), and React state updates drop from one per event to at most 20/second during bursts. Benchmark numbers were measured on this machine with node /tmp harnesses; mobile-device timings were not measured.

## Testing

`pnpm --filter @linxin666/dsh-remote-web-ui typecheck` and `test` (397 pass). ChatView.stream.test.tsx now imports FOLD_FLUSH_MS and advances the flush cadence for the first chunk mount; the final-render and collapse-on-close tests pass unchanged because terminal events flush synchronously. Benchmark: /tmp/bench-fold.mjs over five runs per scenario, medians reported.
