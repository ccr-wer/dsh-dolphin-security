# Agent Note: Native Image Capability Cache Invalidation on Toggle

Status: implemented

## Problem

When sending messages in a session, the describe-image send hook caches the model image capability verdict per session for 30 seconds (`DEFAULT_CAPABILITY_TTL_MS`). When a user switched the "Native image requests" setting in the settings panel, `setNativeImageEnabled` updated the host catalog and called `resolver.invalidate(route)` on the host side, but the client-side `createImageCapabilityChecker` cache lacked an invalidation seam. As a result, subsequent sends in the same session within 30 seconds of toggling continued using the stale capability verdict (rewriting images when enabled, or sending raw image blocks to text-only models when disabled).

## Decision

1. In `packages/dsh-tool-describe-image/src/client/capability.ts`, maintain an `activeCaches` registry and export `invalidateImageCapabilityCaches(sessionId?: string)` to flush cached session capability verdicts.
2. In `packages/dsh-tool-describe-image/src/client/NativeImageSection.tsx`, call `invalidateImageCapabilityCaches()` upon a successful toggle before updating local React state.
3. Extended `client-capability.spec.ts` with tests for global and per-session cache invalidation.

## Consequences

Toggling the native image requests setting now immediately clears client-side capability caches, ensuring the next message send immediately fetches the fresh capability verdict from the host.

## Testing

`pnpm --filter @linxin666/dsh-tool-describe-image test` (374 passed), `pnpm typecheck`, `pnpm test`, and `pnpm test:scripts` all pass cleanly.
