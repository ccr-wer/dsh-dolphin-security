# Agent Note: Shared shim emitter core for the market try-on shell

Status: implemented

## Problem

Five shims in the WebDsh try-on shell each carried a hand-cloned minimal event emitter: `src/net/virtual-websocket.ts` (Emitter), `src/node/worker_threads.ts` (Emitter), `src/node/ws.ts` (WebSocketServer inlined the registry), `src/node/streams.ts` (StreamEmitter), and `src/node/fs.ts` (FSWatcher). All implement on/once/off/removeListener-style registration with catch-and-log listener dispatch; fs had already drifted (no try/catch), demonstrating the duplication hazard the audit flagged.

## Decision

`market/shell/src/node/emitter-core.ts` now hosts one `ShimEmitter` (Map of listener sets; on/addListener/once/off/removeListener/removeAllListeners/listenerCount; emit with per-listener try/catch logging under a per-subclass label; fire as a void alias). All five shims extend it with their existing log label. The vendored node:events implementation (events-impl.ts) was deliberately not reused: it follows Node semantics and propagates listener errors, while every one of these five call sites is a fire-and-forget pump where a throwing consumer must not break the shim.

## Alternatives considered

Reusing events-impl.ts EventEmitter was rejected on the error-propagation contract (above). Adding try/catch to events-impl was rejected: it would silently change Node-parity semantics for every node:events consumer. Not extracting (leaving five copies) was rejected: the fs drift already proved the copies diverge silently.

## Consequences

One intentional behavior delta: fs watcher listener exceptions are now caught and logged like the other four shims instead of propagating out of the volume.watch callback (they previously escaped as unhandled errors). Log labels are unchanged per shim, so console diagnostics stay attributable. StreamEmitter keeps its exported name and full API via inheritance; WebSocketServer's emit widens from private to public (harmless for a shim surface). The try-on bundle changes, so market/dist was regenerated and committed per the market artifact rule.

## Testing

`npx tsc --noEmit` over the shell and `npm run build` (full assemble + vite) pass; `node scripts/market-build` regenerated market/dist and `pnpm market:check` verifies the committed artifacts. Behavior is otherwise identical and covered by the shell's e2e harness shape (no dedicated unit suite exists for these shims; the five clones were assertion-free utilities).
