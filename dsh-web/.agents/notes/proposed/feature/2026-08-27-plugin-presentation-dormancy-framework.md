# Agent Note: plugin presentation dormancy and lazy-materialization framework

Status: proposed

Evidence prerequisites live in [dsh-perf attribution scoreboard](../../implemented/feature/2026-08-27-dsh-perf-plugin-attribution-scoreboard.md). This note also records durable facts about the official client-module contract discovered while probing whether code-level lazy loading is reachable from a plugin.

## Problem

The maintainer asked whether dsh-perf could give our built-in plugins a dormancy lifecycle like browser sleeping tabs, plus real lazy loading. The objective text deliberately gates any implementation on sufficient measured evidence ("no proof, no optimization"). What we know today:

- Idle-page measurement over the running GUI: every built-in package's browser half spends under ~25 ms of main-thread time per minute combined, with **zero** steady-state mutations attributed to any of our roots. The only recurring writers are animation loops (dsh-pet frame swaps, skin status character since cleaned, official app internals).
- Official client-modules contract facts (read from the vendored `@deepseek-ai/dsh-client-modules` source shipped in DSH 0.1.1-rc.2): script execution only *registers* each bundle's factory (lazy CJS table); module bodies run at first import/materialization, memoized per package; resolution of an identifier that never registered its factory **throws loudly**. There is no sanctioned way for a third-party package to defer its own materialization behind a runtime decision - that lives inside the vendored `EntryTree.import` path. Bundle arrival is governed solely by the profile's bundle list.
- Mounting patterns are already on-demand where it matters most: sidebar/tile injections (sidebar-entry-core copies) materialize their React trees when their surface opens, not at boot.

So the two halves of the idea split cleanly:

1. **Code-level lazy loading** - not reachable without upstream changes to the official loader; a plugin cannot both arrive late and register its factory lazily through a public seam.
2. **Presentation-half dormancy** - reachable entirely within plugin boundaries, but currently there is no measured cost for it to save: our own UI contributes negligible steady-state work while visible, and message rows/sidebar rows already ride `content-visibility:auto` degrade.

## Proposal

Do not build the framework yet. Define it precisely plus the evidence trigger that starts implementation:

- **Scope (when triggered)**: voluntary, opt-in parking of *presentation* surfaces only. A `shared/` helper registers {root element, owner id, park(), wake()} tuples; the coordinator watches IntersectionObserver visibility and document visibility; parked trees unmount (not merely hide) and remount on re-entry; service registrations are never touched - dispose of another plugin's service breaks boot for dependents (the observed `slash` incident).
- **Trigger criterion**: the dsh-perf HUD act scoreboard or `__dshPerfAttribution` handle attributing a sustained (>= 60 s) added-node rate >= 20 nodes/s, or long-task sources totalling >= 30 ms of main thread per wall-clock second, to a plugin-owned `[data-dsh-plugin]` subtree during representative multi-session streaming work. One offender or one adopter with measured numbers turns this note into an implemented one; otherwise it stays proposed.
- **Explicit non-goals**: deferring bundle downloads, dynamically splitting client.js, touching `EntryTree`, or central timer arbitration.

## Alternatives considered

- **Build the parking framework now anyway** (speculative): rejected by the repository's own rule - performance issues count only when proven by measurement or user report; today's numbers show the saved cost is approximately zero for this family.
- **Chrome-style process/tab suspension inside the page**: not applicable - page scripts cannot suspend event loops or discard execution contexts; the closest legal mechanism is what is proposed (unmount/remount of subtrees).
- **Upstream feature request for third-party lazy materialization** (e.g. a `dsh.client.lazy` declaration honored by the vendored loader): worth recording upstream once a concrete package demonstrates boot-time cost that matters; until then it adds protocol surface nobody exercises.
- **Do nothing beyond keep the act scoreboard running**: fully acceptable outcome; the scoreboard is cheap (HUD-gated) and the framework can be resurrected from this note the day real offenders appear.

## Acceptance criteria

Implementation may start only when the trigger criterion above fires with reproducible captures attached to this note's successor. A future implemented note must then show: parked-state mutation rates drop to zero for the enrolled surfaces, wake restores pixel-identical UI, no service registrations change hands, boot profile unchanged, and before/after numbers from the same CDP harness used for the Phase-1 baseline.

## Risks

Parking visuals mid-transition (popover closing into an unmount), wake latency on fast scroll-through, observer overhead scaling with enrolled surfaces, and API drift against non-public mount seams - all fail-open if any probe does not recognize the environment.
