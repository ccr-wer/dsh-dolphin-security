# Agent Note: Telemetry read key moves to header-only with digest comparison

Status: implemented

## Problem

`/api/telemetry/summary` accepted `TELEMETRY_READ_KEY` via the `?key=` URL query parameter as an alternative to the `x-telemetry-key` header, and compared it with plain `===`. URL-carried credentials persist in Cloudflare edge logs and analytics, browser history, referrer headers on outbound links, and shared or bookmarked URLs — a durable disclosure of the key until rotation. The protected data is aggregate-only, so the blast radius of misuse is capped, but the credential itself leaked by design.

## Decision

`summaryAuthorized` now accepts the key only via the `x-telemetry-key` header and compares SHA-256 digests of the presented and configured values instead of raw strings. The `?key=` parameter is rejected (403) even when correct. The OpenAPI description gains the header parameter with an explicit note that query keys are not accepted; `api-doc.js` and `docs/telemetry.md` drop the `?key=` instructions and state the reason. The internal telemetry viewer (`market/telemetry-view`) already authenticates via the header, so no consumer needed changes. Tests now pin that a correct key in the query string is denied.

## Alternatives considered

Keeping `?key=` for browser convenience was rejected: that convenience is precisely the disclosure channel, and the documented consumers (curl, the telemetry viewer worker) can all send headers. Timing-safe comparison via `crypto.subtle.timingSafeEqual` was considered; Workers exposes it only on recently added APIs, while hashing both sides through the existing `sha256` helper achieves fixed-length comparison without new dependencies — rejected the newer API for compatibility simplicity. A key-rotation mechanism was rejected as out of scope for this gap closure.

## Consequences

Bookmarks or dashboards that appended `?key=` to the summary URL break with 403 until they send the header instead; no other behavior changes. Anyone who previously shared a keyed URL should rotate `TELEMETRY_READ_KEY` — the old URLs remain in logs regardless of this change. Deployments without the key configured are unaffected (summary stays open by design).

## Testing

`node --test scripts/market-worker.test.mjs` (35 pass): the read-key suite now asserts wrong-header 403, correct-query-param 403, and correct-header 200.
