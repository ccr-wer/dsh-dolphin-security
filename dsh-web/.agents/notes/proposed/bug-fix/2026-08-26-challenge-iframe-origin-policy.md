# Agent Note: Turnstile challenge iframe cross-origin embedding (pending decision)

Status: proposed — user decision requested twice during the optimization run without an answer; options are recorded here, no code changed

## Problem

The worker's `/api/turnstile/challenge` page (market/worker/src/index.js `challengePage`) is embeddable from any origin: the early Referer allowlist check was removed (commit 3385d5254) because legitimate embedders are inherently arbitrary — every user's DSH Web GUI origin differs. A security audit noted that a third-party site could iframe the challenge to mass-harvest solved Turnstile tokens and spend them on `POST /api/like`. The abuse ceiling is low: tokens are single-use and single-action, likes are Turnstile-gated already, and every write is rate- and allowlist-bounded, but the token-farming path exists by design.

## Proposal (awaiting user choice)

Option A (recommended by the audit context): document as accepted risk — the challenge is intentionally origin-agnostic because embedders are arbitrary; abuse is bounded by Turnstile itself plus per-write gating. Option B: add a per-IP write rate limit on /api/like (needs worker-side state, e.g. D1 counters or Workers rate-limiting binding). Option C: switch the invisible challenge to an interactive widget, raising farming cost but changing the user flow. The auditor's origin allowlist was rejected out of hand: it breaks the product's legitimate arbitrary-origin embedders.

## Alternatives considered

Implementing any option without the user's pick was declined: A records a security posture decision, B/C change production behavior of a public endpoint — all three are user-owned calls.

## Consequences

No code or documentation behavior changed by this note. Whichever option the user selects should land as its own change with its own implemented note.

## Evidence

Audit finding with concrete attack path (iframe + token replay into /api/like); challengePage and verifyTurnstile in market/worker/src/index.js; the removed Referer gate rationale lives in commit 3385d5254.
