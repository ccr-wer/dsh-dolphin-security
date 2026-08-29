# Agent Note: dsh-perf plugin activity attribution scoreboard

Status: implemented

Supersession check: no active note covers per-plugin cost attribution; the closest mechanism notes are the render pipeline batch 2 ([batch 2](../feature/2026-08-26-dsh-perf-render-pipeline-batch2.md)) and the shadow rework, both of which govern official-pipeline costs rather than attributing them by owning plugin. This note is a new owner.

## Problem

dsh-perf could measure global browser-side load (FPS, long-task counts) and govern two known hot paths (message rendering, session-list publishes), but it could not answer "which of our own plugins is busy right now". The batch 2 audit found third-party costs only through manual DOM archaeology (better-sidebar row bursts, dsh-annotation 1 Hz full-document scans); with a growing family of built-in plugins under [packages/](../../../../packages/AGENTS.md), steady-state ranking must become observable instead of anecdotal. A related user goal - plugin-level lazy loading and Chrome-style dormant tabs - needs exactly this ranking as its evidence base before any dormancy scheduler is designed.

## Decision

- `perf-attribution.ts` adds one merged `MutationObserver` on `document.body` (childList+subtree) that resolves every added element or text node to its nearest `[data-dsh-plugin]` root - the semantic attribute contract in [semantic-attrs-v1](../../../../packages/skins/skin-center/contracts/semantic-attrs-v1.md) - and counts nodes into fixed time-grid buckets (2 s window, 8 retained = ~16 s lookback). The HUD renders an `act` line with the top-3 plugins plus a merged `rest=` rate.
- Long tasks stop being counted per observer callback (the old code recorded one entry per batch regardless of size) and are now pushed individually into a ring log with duration plus the spec's best-effort container name ('unknown' when absent). The HUD longtask line gains a worst-duration figure; `topSources()` aggregates sources by summed duration.
- Semantics stay deliberately humble: rates are wall-clock over the retention grid so idle time dilutes readings on purpose (that favors chronic cost over momentary spikes); overflow past a 400-node per-callback classification budget and nodes without a semantic root share one "unattributed" bucket, which is included in totals so an all-unattributed page still reads nonzero. Plugins that do not emit `data-dsh-plugin` therefore show up as visibility debt, not as silent zeros.
- Everything rides the existing HUD lifecycle: default-off, disposed with the HUD, one debug handle `window.__dshPerfAttribution` behind `dsh-perf-debug=1` matching the list-gate convention. Classification/bucket math is pure and injectably clocked; `index.ts` wires DOM and rendering only.

## Alternatives considered

- **Chrome tracing / CDP CPU profiling inside dsh-perf**: rejected for the always-on path - profiling from within the observed page changes what it observes, and export sizes make it unusable as a resident tool. CDP stays the external ground truth used during measurement sessions.
- **Script-level attribution via stack sampling**: rejected - no synchronous API exists for "who caused this long task" beyond spec attribution containers, which are frequently empty; a sampler would add constant overhead to fix a label quality problem that `data-dsh-plugin` roots already solve.
- **Timing every plugin's effects/microtasks via monkeypatching**: rejected - patching shared platform APIs violates the repository boundary that plugins cooperate through cordis services and slots, not value-import interception, and it would attribute framework work to whichever plugin patched last.
- **Making dsh-perf dispose other plugins' services to sleep them**: rejected outright - a missing service breaks boot for dependents (observed live when a profile edit left `slash` unprovided), so any future dormancy feature may only park presentation surfaces. The scoreboard measures; it does not actuate.

## Consequences

- Bundle cost sits in the client half and only runs while the HUD is enabled; with defaults unchanged nothing extra polls or observes.
- Ranking granularity is bounded by semantic-attribute adoption: packages not stamping `data-dsh-plugin` land in one indistinguishable bucket until they adopt the contract, which is now a directly measurable gap.
- Wall-clock dilution means single bursty frames never dominate the line; worst-case long tasks remain visible via the max field and the debug source list instead.
- The scoreboard is the prerequisite evidence layer for any later lazy-load / dormancy design: such a proposal starts from measured Top-N plugin costs and may only govern presentation-half surfaces.

## Testing

- `tests/attribution.spec.ts`, 12 cases: same-grid accumulation, cross-window rotation with wall-clock rates, unattributed bucket plus top-N/rest identity, retention pruning, stable tie ordering, budget overflow into unattributed, jsdom wiring (element and text-node attribution, dispose-and-reinstall), NaN-clock fail-open, long-task ring count/max/source merge, and source-label fallback. Package gates: vitest 41/41, typecheck, build all pass; the running GUI keeps serving the previous bundle until a user restarts, so live visual verification of the line is deferred, consistent with the report's evidence rules.
