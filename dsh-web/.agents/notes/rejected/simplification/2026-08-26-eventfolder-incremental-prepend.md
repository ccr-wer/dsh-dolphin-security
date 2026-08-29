# Agent Note: Incremental EventFolder prepend — measured below the evidence bar

Status: rejected — measured cost is below any user-perceptible threshold; no change shipped

## Problem

A read-only performance audit proposed replacing `EventFolder.prepend`'s full `createState([...older, ...messages])` rebuild with incremental map insertion, arguing cumulative O(N²/P) recompute across a deep "load older" scroll-back session (`packages/dsh-remote-web-ui/src/mobile/messages.ts`).

## Proposal (declined)

Insert older page rows into the existing index maps incrementally instead of rebuilding FoldState per prepend.

## Alternatives considered

Implementing the incremental insert was declined after measurement. Leaving the code as-is carries no measured cost; the quadratic exponent is bounded by user click rate and tiny per-click absolute time.

## Evidence

Benchmark over the real EventFolder (node, /tmp/bench-prepend.mjs, 5 runs): prepending a 30-message page onto an 8,000-message folder costs a 0.62 ms median (worst run 1.40 ms), and 100 successive prepends — an entire maximally deep scroll-back session — total 0.5 ms. The rebuild happens once per user gesture, never per streamed event. No user-facing cost exists to optimize; adding incremental-insert invariants to FoldState would be complexity and regression risk without payoff. Revisit only with a real-device trace showing otherwise.
