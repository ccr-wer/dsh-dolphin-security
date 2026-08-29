# Agent Note: Bounded writes and manifest allowlist for the market edge API

Status: implemented

## Problem

The three unauthenticated POST endpoints (`/api/like`, `/api/install`, `/api/telemetry/event`) read their JSON bodies with no size cap, and the like/install handlers keyed D1 rows entirely by client-asserted `(kind, asset_id)` — format-checked but never membership-checked. Scripted requests with fresh 64-char ids minted rows in `likes`, `install_counts` and `telemetry_events` linearly with request count, growing D1 storage and write costs and polluting the publicly served stats. A read-only audit confirmed every host-side route family bounds bodies (readBoundedJson, readBodyLimited, MAX_UPLOAD_BYTES) while the edge Worker — the only Internet-facing surface — had none.

## Decision

Two guards, both minimal and additive:

- `market/worker/src/body.js` (`readJsonCapped`): a Content-Length fast-path reject plus a post-read length check, returning `payload-too-large` (413) or `invalid-json` (400). Caps: 4 KiB for like/install, 16 KiB for telemetry (64 small items maximum).
- `market/worker/src/asset-allowlist.js` (`isKnownAsset`): like/install asset ids must appear in the served manifests (`/manifest/{skins,pets,plugins}.json` via the worker's own ASSETS binding, the same pattern `handleNpmDownloads` uses); unknown ids get 400 `unknown-asset` before any D1 write. Membership is cached per isolate for five minutes, keyed to the binding identity. If the manifests are unreadable, writes are allowed (availability rule: the binding is the worker's own asset store, not attacker-inducible).

Telemetry subjects stay unallowlisted on purpose: heartbeats report locally installed plugins that may not come from the Workshop, so membership checks would corrupt legitimate telemetry; the 16 KiB cap, MAX_ITEMS and daily-collapse bound its growth instead.

## Alternatives considered

Streaming the body with byte counting to cap isolate memory was rejected: the isolate already buffers request bodies and the realistic abuse is parse cost plus D1 row spam, both bounded by the post-read cap and the Content-Length fast path. Failing closed when manifests are unreadable was rejected: an asset-serving hiccup would disable likes/installs service-wide, and the attacker cannot induce it. Rate limiting per device fingerprint was rejected for this change: the fingerprint is client-asserted, so it adds code without stopping scripted rotation; membership plus Turnstile already bounds the damage to one vote per device per published asset.

## Consequences

Real clients are unaffected: legitimate bodies are far below the caps, card fetches always name published assets, and the card rolls back on any non-ok status. Writes for assets removed from the manifests are now rejected while their historical counts keep displaying. A freshly published asset may be rejected for up to the five-minute cache TTL per isolate. The challenge-iframe token-farming path (cross-origin framing of `/api/turnstile/challenge`) remains open and is tracked as a separate finding.

## Testing

`node --test scripts/market-worker.test.mjs` (35 pass): new cases cover the Content-Length fast path, the streamed no-Content-Length path, unknown-asset rejection with an untouched DB stub, manifest-listed acceptance with allowlist cache reuse, and the manifest-outage availability rule.
