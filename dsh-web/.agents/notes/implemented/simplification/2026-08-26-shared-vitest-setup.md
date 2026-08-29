# Agent Note: Shared vitest setup via sync-shared; web-settings re-exports the shared config

Status: implemented

## Problem

The test-harness browser-module loader (`vitest.setup.ts`, the `window.__ModuleLoader__` shim used by @deepseek-ai client-half bundles under vitest) existed as byte-identical copies in `shared/` and three packages (web-settings, tool-describe-image, remote-web-ui) with no drift guard — a loader fix would have to be replayed by hand into every consumer.

## Decision

`shared/vitest.setup.ts` is now a sync-shared source with generated copies at the three package roots; the drift gate (`test:scripts`) enforces parity. `packages/dsh-web-settings/vitest.config.ts`, which duplicated `shared/vitest.config.ts` byte-for-byte, now re-exports the shared config — the same reference-not-copy pattern as the shared tsdown build preset (relative paths inside resolve against the consuming package root).

## Alternatives considered

An audit summary also claimed three identical `vitest.config.ts` files; direct measurement showed only web-settings duplicates shared's — tool-describe-image needs `jsx: automatic` and remote-web-ui needs `vite-tsconfig-paths`, a node environment, and wider includes, so those two were deliberately left alone. Syncing vitest.config.ts as a generated copy was rejected: configs are package entry points, not src modules, and the re-export covers the one true duplicate without a new copy mechanism.

## Consequences

Loader fixes propagate through one edit plus `node scripts/sync-shared.mjs`; divergence fails CI. The sync table grew to 103 copies. No test behavior changed — all four suites run the same setup code as before.

## Testing

`pnpm test:scripts` (sync table + drift suites), `pnpm docs:check`, and the full test suites of shared (74), dsh-web-settings (66), dsh-tool-describe-image (374), and dsh-remote-web-ui (397, after its package build provides lib/mobile.js) — all pass.
