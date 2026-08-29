# Agent Note: pet frames2d canvas bitmap buffer replaces per-frame img.src swaps

Status: implemented

Supersession check: no active note owns frames2d *playback mechanics*; [frames2d gameplay](../../feature/2026-08-25-frames2d-gameplay-miku.md) owns the manifest contract and gameplay layer, which are untouched by this change. Evidence source: [dsh-perf attribution scoreboard](../../feature/2026-08-27-dsh-perf-plugin-attribution-scoreboard.md) measurement session.

## Problem

The Phase-1 baseline census attributed ~39 `<img>.src` swaps per 8 s (steady idle, `miku-pet-stopN.webp` cycle) to the frames2d renderer: every tick swapped the image element's source, which drives an image decode + paint invalidation per frame even when the browser cache holds the bytes. It was the last plugin-attributable recurring writer after the [orca write-surface cleanup](../simplification/2026-08-27-orca-status-character-dead-write-surfaces.md); style-recalc-wise harmless, but it fed the native decode/paint chain continuously and made the pet the largest single DOM-writer we own.

## Decision

`frames2dRenderer.mount` now probes capabilities once and picks one of two presentation modes:

- **Canvas bitmap buffer** (when `createImageBitmap`, `fetch`, and a real 2D context exist): a warm pass decodes every configured frame exactly once into memoized `ImageBitmap`s; playback draws onto one `<canvas>` with a generation-token guard (stale async paints drop out), resizing the backing store only when decoded dimensions differ, clearing explicitly otherwise. Steady-state playback performs **zero DOM mutations and zero re-decodes**.
- **Classic `<img>` fallback**: byte-for-byte the historical behavior (guarded `src` swaps) whenever any probe fails - jsdom, tests, or exotic embedded runtimes keep working identically.

Playback scheduling, phase mapping, gameplay override/release, stall watchdog, reduced-motion hold, and idempotent dispose are unchanged; dispose additionally settles pending decodes and calls `close()` on every bitmap. The manifest v2 `frames2d` block gains no fields.

## Alternatives considered

- **Offline spritesheet merge** (combine track frames into atlases at build time): attractive long-term (matches sprite2d's compositing story) but rejected this round - it mutates contributed asset packages and the published miku bundle, plus the same before/after risk profile the maintainer preferred not to take for the visual path.
- **React-state-driven frames**: rejected - the renderer was deliberately built without per-frame React state; porting onto React would reintroduce reconciliation cost per tick.
- **Pure CSS `steps()` animation**: rejected - per-frame durations come from the manifest as irregular lists, and stepping backgrounds repaints per frame (performance-guidelines R3's rationale applies to skins' hooks equally).
- **Keep swapping cached images**: rejected by measurement - cache hits still pay decode scheduling and invalidation on every tick; drawing a resident bitmap does not.

## Consequences

- Idle-page DOM writes attributable to the pet drop to zero while visible; decode work becomes O(total frames) once instead of O(ticks).
- Bitmap memory is pinned from mount to dispose and bounded by the served track list (frames are small webp cells).
- Behavior is pixel-equivalent by construction in both modes; the canvas fakes prove the paint/dispose contract. Live confirmation captured same day after service restart (archived snapshot [20260827-phase1-performance-round-snapshot](../../../../docs/archive/20260827-phase1-performance-round-snapshot.md)): pet-attributed `<img>.src` mutations dropped 74 -> 0 per 15 s window on the running GUI, total mutations -24%, trace TaskDuration -10%, UpdateLayoutTree -21%, Paint -28%, ScriptDuration -44% versus the Phase-1 baseline.

## Testing

- `src/client/renderers/frames2d.test.ts`: three new cases cover the canvas branch - canvas mounts instead of img and paints advancing frames via drawImage (warm-pass decodes each configured frame once, six bitmaps for the test config), backing-store sizing from decoded dimensions plus bitmap release after dispose, and a phase switch keeps painting with zero child-element changes. Original eight cases pass unchanged against the `<img>` fallback, proving mode selection does not disturb legacy environments. Package gates: vitest 448/448, typecheck clean, client bundle rebuilt.