# Agent Note: dsh-perf render shadow rework

Status: implemented

## Problem

The dsh-perf "render degrade" layer never once engaged in the live GUI, and its intended look was wrong:

1. **P0 CSS degrade was silently dead**: the injected rule was
   `[data-chat-flow-kind="assistant-step"],\n[data-chat-flow-kind="tool-call"]\n  content-visibility: auto; ...` — the selector list was missing the opening brace, so the CSS parser discarded the whole rule. It was also gated behind the HUD boot, which is off by default, so it only ever applied when the HUD was explicitly enabled.
2. **P1 assistant-step shadow never registered**: `registerAny = ctx.slots.register; registerAny(...)` strips the service instance (`this`), so `register` threw `Cannot read properties of undefined (reading 'effect')`. The original catch was empty, hiding the failure; the fiber chain proved the official `AssistantNodeView` always rendered.
3. **The registered priority lost the cell**: even with registration fixed, the shadow must win the keyed slot cell under "lowest renders", and the official capture must tolerate `React.memo` components (whose `typeof` is `object`, not `function`).
4. **The degraded view was rejected**: the first working iteration substituted a custom "推理 (N 字符)" fold plus a `完整渲染` button. The user found it ugly and asked for a look that is both clean and fast.

## Decision

Rework the assistant-step shadow to be look-preserving:

- All assistant-step nodes render through the official renderer, pixel-identical to the official UI (no folding, no buttons, no degraded view).
- For heavy settled messages (>20KB text, or the localStorage-tunable threshold) the shadow forwards props with `data.status` forced to `running` for 600ms, so the official streaming branch renders plain fences (it already skips shiki while streaming); a timer then flips back to the settled state, moving the highlight spike off the turn-end hot path.
- The official renderer is captured lazily at first render (all plugins have applied by then), excluding the shadow entry itself; registration uses the lowest existing priority minus one to win the keyed cell, and the register call is bound to the slot service instance.
- P0 CSS is fixed (missing brace), extracted out of the HUD boot into an always-on installer that follows the master enable switch.
- All three shadow/enable failure paths now log (warn) instead of swallowing silently, plus one per-page diagnostic line reporting the registered priority and the projected cell winner.
- A new client-side session-tail integrity observer (perf-integrity.ts) listens on runnning->idle edges: it checks the final assistant-step finalNode presence, window tail vs. host history tail seq, and editor residue after a busy-state Stop click. Findings go to a localStorage ring buffer (`dsh-perf-integrity-ring`) plus console.warn and never touch rendering.

## Alternatives considered

- **Keep the degraded view (fold + full-render button)**: rejected on design grounds — the user explicitly asked for a look that stays clean while still optimizing.
- **Drop the shadow entirely and keep only P0 CSS**: reasonable as a stopgap, but it loses the highlight-spike deferral that the upstream F3/F4 findings identify as the long-output hot cost; the look-preserving shadow keeps that value.
- **Explicit highest-priority slot registration**: rejected because the slot contract documents "lowest renders" and the registration order is not guaranteed; the min(existing)-1 floor is robust to either allocation path.

## Consequences

- Heavy message highlight spikes no longer land at turn end; styles match official rendering exactly.
- `content-visibility` virtualization is active by default (when the plugin is enabled), independent of the HUD.
- The integrity observer is evidence-only; normal turns produce no log noise (findings only).
- Upstream F3/F4 (block-level memo, tail-window rendering) remain the real O(n^2) fix for single-block long text and are out of plugin scope.

## Verification

- `pnpm --filter @linxin666/dsh-perf typecheck && pnpm --filter @linxin666/dsh-perf test`: passed (6 new classifier tests).
- Live GUI (DSH 0.1.1-rc.2): fiber chain `SlotOutlet -> StrictSessionEntry -> SlotErrorBoundary -> SessionEntry -> ContextualEntry -> PerfAssistantShadow -> AssistantNodeView -> AssistantMarkdown`; console diagnostic reports the shadow as the projected cell winner; the heavy-path run (threshold 120) rendered 239 chars of final content through the official look with no degraded UI; `content-visibility: auto` computed on rows; the previous failing iteration (degraded fold) no longer appears.
- The pre-existing unbound-register failure is now surfaced as `[dsh-perf] assistant shadow registration failed: ... (reading 'effect')` before the fix, and absent after.
