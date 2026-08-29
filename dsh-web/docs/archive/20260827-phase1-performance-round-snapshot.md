# Snapshot: Phase-1 measurement-driven performance round (2026-08-27)

> Archived validation snapshot (docs policy: temporary validation snapshots live here). Numbers are single-pass headless CDP captures against the running GUI at 127.0.0.1:3080, idle steady state, macOS arm64 - they are evidence for this round's decisions, not cross-machine guarantees. Harness scripts were ephemeral (/tmp), methodology preserved in the cited Agent Notes.

## Fixes verified live on this date

Shipped commits (local dev): e537092e1 (dsh-perf attribution scoreboard), c8c89e7aa (orca dead-write cleanup), dca3959c3 (pet frames2d canvas bitmap buffer), 07827ef99 (dormancy proposal).

Serving status during capture: dsh-perf new bundle ACTIVE, dsh-pet new bundle ACTIVE (profile link:// into the workspace), orca-link hooks OLD (market reinstall serves the pre-fix published asset; the skin-center API correctly refuses user-modified hooks files with `hooks-require-review`, origin:user - integrity gate working as designed, restore performed immediately).

## Census comparison (15 s MutationObserver window)

| Metric | Baseline | After pet fix |
| --- | --- | --- |
| Total mutations | 385 (25.7/s) | 293 (19.5/s), -24% |
| IMG src swaps attributable to pet frames2d | 74 | **0** (canvas bitmap mode confirmed in production Chromium) |
| Official bare SPAN style writes | 94 | 94 (upstream boundary, unchanged) |
| orca-link status-character style/attr writes | 162 | 162 (old code still served; lands with next release) |

## Timeline comparison (20 s trace)

| Metric | Baseline | After | Delta |
| --- | --- | --- | --- |
| TaskDuration | 1.90 s | 1.71 s | -10% |
| ScriptDuration | 0.16 s | 0.09 s | -44% |
| UpdateLayoutTree self time | 653 ms | 518 ms | -21% |
| Paint / PrePaint | 187 / 143 ms | 134 / 96 ms | -28% / -33% |
| RecalcStyleCount | 1866 | 1864 | flat |

Reading: recalc *count* is pinned by the orca dead-variable writes that are still served pre-release; the per-recalc cost and the paint chain got cheaper because the pet invalidation source disappeared. The remaining measurable lever arrives when the fixed orca-link ships through release + market and a reinstall picks it up.

## Deferred items

- Live numbers for the orca cleanup: blocked by design on release/distribution, not on engineering.
- HUD act-scoreboard visual acceptance: requires flipping hudEnabled (user-visible setting change); unit-covered meanwhile.
- Dormancy framework: evidence-triggered proposal, see .agents/notes/proposed/feature/2026-08-27-plugin-presentation-dormancy-framework.md
