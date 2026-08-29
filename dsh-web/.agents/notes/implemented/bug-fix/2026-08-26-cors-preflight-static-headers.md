# Agent Note: Static preflight allow-headers; wildcard CORS kept as design

Status: implemented

## Problem

The market worker's OPTIONS preflight reflected the request's `access-control-request-headers` verbatim, advertising an unlimited custom-header surface that grows silently as handlers start reading new headers. The same audit asked whether `access-control-allow-origin: *` on the write endpoints should be pinned or removed: it enables drive-by cross-origin writes from any website's visitors.

## Decision

`preflight()` now answers a static `access-control-allow-headers: content-type` — the only header any preflighted handler reads — instead of reflecting the request. `access-control-allow-origin: *` is kept deliberately and documented in place: the legitimate writers are MarketCards embedded in arbitrary per-user DSH GUI origins (loopback, LAN hosts, custom domains) that cannot be enumerated, so origin pinning would break the product; the actual abuse boundary on writes is Turnstile plus the manifest allowlist, not CORS, and no cookies or credentials exist on these endpoints.

## Alternatives considered

Removing CORS from the POST endpoints or pinning allowed origins to dsh-market.com was rejected: browser preflights from every GUI origin would fail and likes/installs would stop working for all users — CORS here is load-bearing, not decorative. Reflecting only an intersection of requested and known headers was rejected as complexity without payoff: exactly one header is ever needed. Cross-origin token farming via the challenge iframe is the related residual risk and is tracked separately (it needs a product-level decision, since the legitimate embedders are the same arbitrary GUI origins).

## Consequences

Preflight responses no longer echo attacker-chosen header names; the four preflighted paths behave identically for real clients (content-type is all they send). Wildcard ACAO remains a conscious, in-code-documented trade-off.

## Testing

`node --test scripts/market-worker.test.mjs` (36 pass), including a new case asserting the preflight returns the static list even when arbitrary headers are requested.
