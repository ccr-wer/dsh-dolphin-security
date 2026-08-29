# Skin Runtime Performance Guidelines (v1)

Contract owner: skin-center (single owner, conflict resolution does not rely
on load order). Version: `performance-guidelines/v1` (2026-02, authored after
the orca-link session-switch latency investigation).

These are the runtime-performance rules for skin **hooks** (`hooks.mjs`,
`facets.client`) and their stylesheets. They exist because skins share the
host page with the DSH shell and every plugin: a skin that watches the whole
document or keeps GPU layers alive degrades everyone. The rules are advice
with teeth — a code review hook check and a human review of the case study
([orca-link hooks](../../../packages/skins/skin-center/skins/orca-link/hooks.mjs),
[patches](../../../packages/skins/skin-center/skins/orca-link/patches.css))
should reject their violation.

## R1 — DOM observation must be scoped and short-circuited

Never broadcast a full-tree scan from a `MutationObserver` callback:

- Watch the narrowest possible scope. Observing `document.body` with
  `subtree: true` is only acceptable when every callback answers "did my
  anchor actually change?" in O(1) before doing any work.
- Cache the anchor. A conversation/session root is rebuilt only on session
  switches; between switches the phase lives on the same node, so a
  `let memo = null; memo = memo?.isConnected ? memo : locate()` cache is
  exact (a rebuilt root is a different node, `isConnected` flips on the old
  one, and the next callback re-locates).
- Skip fully mounted state. For per-seat work, record the mount phase or the
  exact element references on the binding and return early when nothing
  changed; only re-run the "may need rebuild" path when an element or phase
  actually changed.
- High-churn regions (terminals, streaming input backdrops) should be
  excluded from work with a fast `closest()` check before any scanning.

## R2 — Host-glyph fingerprint matching must be one regex pre-scan

When a skin redraws host SVG glyphs by matching path fingerprints:

- Compile the fingerprint table once into a single alternation regex and use
  `regex.test(html)` as the boolean gate. Per-svg `includes()` loops over
  N fingerprints turn a session-loading DOM insert into O(svgs × N × len)
  string work; one regex test makes it O(len).
- Keep the ordered key table for the *decision*: "first key in the table that
  appears" is the precedence contract, and the pre-scan regex only answers
  the boolean. Do not reorder or deduplicate keys to let the regex decide.
- Never clone a fresh svg. A svg that has no skin art yet carries only host
  markup — read `svg.innerHTML` directly. The clone/remove-art dance is only
  needed on an already-reconciled svg.
- Preserve idempotency: re-reconciling an already-art'd svg must not stack a
  second art group (guard on the art attribute / recorded name).

## R3 — Frame loops and infinite animations must pause when hidden

- A `setTimeout` frame chain (character sprite atlases, per-frame CSS-variable
  writes) must subscribe to `visibilitychange`: hidden = clear the pending
  timeout; visible = reschedule from the current sequence index (never reset
  the animation state).
- Mirror the hidden state onto an attribute the stylesheet can read
  (e.g. `body[data-*tab-hidden]`) and set `animation-play-state: paused` for
  the skin's own infinite `@keyframes` loops. The stylesheet pause is what
  actually stops the compositor work.
- Do not write CSS custom properties that nothing consumes. Each
  `style.setProperty` is a style-recalc surface; a consumed-by-nobody
  variable written 60+ times per second is pure waste.
- Animate with composited properties (`transform`, `opacity`). Animating
  `background-position` repaints per frame: it rasterizes instead of
  compositing and shows up in long-task traces.

## R4 — `will-change` must not be parked on full-screen or idle layers

- `will-change: opacity, transform, filter` keeps a GPU compositing layer
  alive **forever**, even when nothing is animating. A static 0px filter
  (`blur()`) is a no-op; the layer cost is not.
- Only keep `will-change` on elements in a *sustained* animation (e.g. an
  infinite loop already covered by R3); never on full-viewport fixed
  backgrounds that merely crossfade — a .64s transition promotes the layer
  automatically for its duration and releases it afterwards.
- Prefer visibility/display switches (with the opposite theme hidden) over
  layering both scene sets, and keep the visible scene count at one.
- `backdrop-filter` is realtime and expensive: keep its covered area to the
  smallest surface that needs the effect, avoid animating it, and test with
  scrolling under the blurred surface.

## R5 — Never interleave layout reads and writes in mutation callbacks

- `getBoundingClientRect()` / `offset*` reads force layout. In a mutation
  storm (large DOM inserts), a read-write-read-write pattern in one callback
  is layout thrashing: batch all reads first, then all writes.
- Cache measurements on the binding; recompute only when the referenced
  element changes. A restore-button re-anchor on an unchanged seat is the
  classic offender — skip it via the R1 short-circuit.

## R6 — Delegation of cleanup (existing contract, restated)

Every observer, listener (`visibilitychange`, `pointermove`, `click`,
`focusin`...), timer and interval created in `apply()` must be registered
through `ctx.onCleanup` and torn down in reverse order, including new
global-body attributes. A skin that leaks observers doubles the cost of every
future session switch.

## Verification

Measure before and after with the DevTools Performance panel during session
load and session switch (the heaviest DOM operations a skin hooks into).
Long tasks with an aggregate > 100ms, or frames on the main busied line
during those operations, indicate a violation of the rules above. Per-skin
tracking numbers serve as regression baselines; include them in the PR body.
