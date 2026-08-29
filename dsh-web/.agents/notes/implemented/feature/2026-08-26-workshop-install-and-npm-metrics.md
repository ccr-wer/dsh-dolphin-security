# Agent Note: Workshop install counts and per-plugin npm download metrics

Status: implemented

## Problem

The Workshop card and dsh-market.com ranked items by device-backed likes only. npm download numbers existed only as family badges, and no per-item signal showed whether the Workshop itself was being used. Site owners wanted both: a Workshop-specific install count and, for npm-backed plugins, an npm registry download count, kept strictly separate.

## Decision

Two independent metrics, merged into the shared `/api/stats` read surface and the card/site rendering, but never summed:

- **Workshop installs**: one-shot `install_events` rows plus `install_counts` aggregates (migration `0004_install_events.sql`). `POST /api/install` records one success event per install, Turnstile-gated, with a deterministic event id of (kind, asset_id, hashed device fp, install_id), so a retry of the same install collapses while a fresh install counts again. All three statements (insert, recount, select) run in one D1 batch. The browser half fires the report only after the host gateway or pluginManager install resolves successfully, and the returned count updates the card optimistically.
- **Per-plugin npm downloads**: `GET /api/npm-downloads` reads the served plugin manifest to derive the package allowlist (no query parameter ever drives an upstream lookup), fetches the npm `point/last-month` API per package, and caches per isolate for one hour with a 30-minute edge cache. Unpublished or unavailable packages stay absent from the response, never zero.
- The Turnstile challenge iframe now accepts an `action` (`market-like` or `market-install`) in the postMessage request so the same hidden widget serves both write endpoints.

The card and site render `installs` from `/api/stats` and npm counts from `/api/npm-downloads` as separate labels; items without an npm name never show the npm metric.

## Alternatives considered

- Reusing heartbeat UV as the install count: rejected for the card, because the heartbeat counts installed-and-enabled browsers (a retention-style signal) and cannot separate Workshop installs from other sources.
- Counting clicks on the install button: rejected; a click is not an install, and failed installs must not count.
- Baking download counts into the static manifests: rejected; the manifests are deterministic build artifacts and `market-build --check` compares them byte-for-byte — a network-derived field would go stale and break the gate.
- Moving npm counts into `/api/stats`: rejected; `/api/stats` is cached no-store and opinions differ by refresh cadence, while the npm batch wants hour-scale caching. It also keeps the two metrics physically separate.

## Consequences

- Install counts start at zero; existing installs before the migration are not backfilled. Both cumulative counts and the npm batch become meaningful on the next user actions and deploys.
- The write endpoint is anonymous and Turnstile-gated like likes, so forged writes are limited but not impossible; accepted as noise for trend reading.
- Plugin installs that happen outside the Workshop card (direct `dsh plugin` in a terminal) are not reported and do not move the Workshop install count.
- `/api/stats` now carries an `installs` object; consumers that ignore unknown fields keep working, and `readInstalls` degrades to empty counts when the migration has not been applied.

## Verification

`pnpm test:scripts` (market-worker.test.mjs covers install recording, params rejection, npm batch caching and manifest-unavailable degradation), `pnpm --filter @linxin666/dsh-client-ui-market test` and `typecheck`, `pnpm market:check` and `pnpm docs:check`.

Related: [anonymous install telemetry](../feature/2026-08-24-anonymous-install-telemetry.md) (per-browser heartbeat remains the retention signal, not superseded) and [npm badge endpoint](../feature/2026-08-24-npm-badge-endpoint.md) (family totals, not superseded).
