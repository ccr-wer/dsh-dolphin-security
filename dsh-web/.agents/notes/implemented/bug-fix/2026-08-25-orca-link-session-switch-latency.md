# Agent Note: orca-link session-switch latency fix

Status: implemented

## Problem

User report: ORCA LINK (orca-link) skin feels sluggish specifically on session load, session switch, new-task creation and the `/` skill picker, while default or other skins are measurably faster. The baseline rules out the DSH core: the skin adds client-side runtime that the others do not. Static analysis of `packages/skins/skin-center/skins/orca-link/hooks.mjs` + `patches.css` found the amplification chain:

- 12 body-level MutationObservers, each doing full-tree scans per mutation batch (`conversationRootOf` walks every `[data-phase]` node, composer seats re-run `mountBinding` with `getBoundingClientRect` reads) — session load/switch insert hundreds of nodes in one batch and pay 12 full scans plus layout work.
- The icon reconciler matches every inserted SVG against ~90 path fingerprints with a per-key `includes()` loop and clones the svg first.
- Full-viewport scene layers carry `will-change: opacity, transform, filter`, keeping GPU compositing layers alive permanently; a crossfade also animates filter.
- The status-character frame loop ticks every 83ms and an infinite `orca-ch-orcaGateWeave` steps animation runs forever, even while the tab is hidden.

## Decision

Apply four behavior-preserving optimizations (no visual, semantic-attribute or cleanup-contract change):

1. Icon matching: compile the fingerprint table into one alternation regex used as a boolean pre-scan (`iconKeyRegex.test`) — a single linear scan instead of ~90 `includes()` calls per svg. The ordered key table still decides the name, preserving first-key-in-table precedence. A fresh (not yet art'd) svg reads `innerHTML` directly, skipping the clone/remove-art dance.
2. Shared conversation-root memo: `conversationRootMemo()` caches the located root and reuses it while `isConnected`; session switches rebuild the root, the old node disconnects and the next callback re-locates. Both the scene sync and the link-status sync now share the cache.
3. Composer collapse `mountBinding` short-circuit: when the seat binding is mounted with the same card, root, phase and handles, the callback returns before the phase/compose checks; a collapsed seat still re-anchors its restore button. `mountedPhase` is recorded on the binding.
4. Background throttling for the character: `visibilitychange` clears the pending frame timeout while hidden and reschedules from the current sequence index on return; the hidden state mirrors to `body[data-orca-page-hidden]` and the stylesheet pauses the infinite gate-weave (`animation-play-state: paused`). `will-change` is removed from the scene layers and the wordmark, so the full-viewport layers stop parking GPU compositing layers when idle (transitions still promote for their duration).

The dropped sub-item is recorded honestly: deleting the `--orca-status-column` / `--orca-status-row` writes was planned but abandoned, because the existing spec asserts their presence and an external CSS consumer cannot be excluded — no observable waste was proven.

## Alternatives considered

- **Light-mode toggle in the skin** (disable character/scene/icon modules per user setting): rejected for this change. The v2 skin manifest has no settings surface; adding one requires a contract extension plus UI, a much larger scope than the reported defect.
- **Sprite animation rebuilt on composited transform** instead of `background-position`: high value but needs screenshot-grade visual verification of atlas alignment across all 10 status rows; kept as a second-phase candidate, not shipped here.
- **Not touching the skin** (user switches skin): rejected — the user chose the skin for its look; the fix targets waste, not the design.

## Consequences

Foreground behavior is visually identical: scene crossfades, character frames, icon art and the signal chip render as before. Hidden tabs stop burning the frame loop and the weave. Per-mutation cost in session load/switch drops from "12 full-tree scans plus per-svg 90-key matching plus layout reads" to short-circuited, cached lookups. The vendor-facing rules are captured in `packages/skins/skin-center/contracts/performance-guidelines-v1.md` so future skins inherit the same discipline. The sprite transform rebuild remains open; The port decision ([orca-link v2 skin port](../../feature/2026-08-25-orca-link-v2-skin-port.md)) stands unchanged: this fix is equivalence-preserving, not a behavior cut.

## Verification

- `pnpm --filter @linxin666/dsh-client-ui-skin-center test` — 32 files, 561 tests passed (2 new: fingerprint reconcile equivalence/idempotence, tab-visibility throttling).
- `pnpm --filter @linxin666/dsh-client-ui-skin-center typecheck`.
- Skin-center check, market build regeneration and live GUI numbers recorded in the change PR.
