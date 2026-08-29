# Agent Note: nosniff on worker-served HTML and markdown

Status: implemented

## Problem

The worker-rendered responses — the markdown homepage representation (whose body interpolates manifest-derived fields) and `/api-docs.html` — set only content-type, cache-control and ACAO, with no `x-content-type-options` or referrer policy. Pure defense in depth: nothing today sniffs these bodies, but a future regression in content-type handling would have no second barrier.

## Decision

Both responses now send `x-content-type-options: nosniff`. No other headers change; the values are manifest-derived but already escaped by construction, so this is one-line hardening per response. Tests assert the header on both.

## Alternatives considered

Adding a blanket header middleware for every worker response was rejected: the JSON API responses already declare a JSON content-type and nosniff there changes nothing, so a shared wrapper would be ceremony without coverage gain. Adding `referrer-policy` was rejected as unrelated to the MIME-confusion gap and unnecessary for pages that carry no credentials.

## Consequences

No behavior change for conforming clients; browsers that would have MIME-sniffed a mislabelled future response now refuse. The header pair is pinned by the existing homepage-markdown and api-docs tests.

## Testing

`node --test scripts/market-worker.test.mjs` (36 pass) with nosniff assertions on both responses.
