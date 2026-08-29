# Agent Note: orca-link status character dead write surfaces removed

Status: implemented

Supersession check: no active note owns the status character frame loop; [performance-guidelines-v1](../../../packages/skins/skin-center/contracts/performance-guidelines-v1.md) rules R3/R5 own the *rules* but no note records this hook's compliance state. The measured-case-study owner for hooks cost remains the contract document itself.

## Problem

A measurement pass (external CDP timeline + in-page write-primitive fingerprinting over the running GUI) showed the idle main thread spending its budget outside JavaScript: ~93 style recalculations per second, UpdateLayoutTree 653 ms / 20 s, driven by DOM writes rather than by any plugin JS. Fingerprinting attributed the recurring writes to two animation systems; the skin-side one was the orca-link status character:

- `render()` wrote **four** CSS custom properties per tick on the container AND four more on the sprite (`--orca-status-column/row/x/y`), while the entire stylesheet consumes only `--orca-status-x/y` on `.orca-ch-statusCharacterSprite` (background-position for atlas stepping). Six of the eight writes had zero consumers.
- Every tick also flipped a `data-orca-link-frame` attribute through a guard - and a repository-wide audit found no stylesheet or script reading it.
- Each pointless `setProperty` is a style-recalc surface per performance-guidelines R3 ("do not write custom properties that nothing consumes"); at 4-6 ticks per second every idle page paid recalc paint-chain work for pixels nobody reads.

## Decision

The container-level block now mirrors only what consumers exist:

- `data-orca-link-status` keeps its guarded attribute write (bubble glyph and weave styles read it).
- `data-orca-link-frame`, container-level `--orca-status-*` variables, and sprite-level `--orca-status-column/row` are no longer written anywhere.
- The two surviving sprite writes gained read-before-write guards so repeated renders of the same frame skip the set entirely (status flips reset frames anyway).
- The spec assertion that previously blessed a dead variable now asserts the authoritative signal instead: sprite `--orca-status-x` non-empty, container column empty.

Visual output is untouched by construction: the composed background-position values and alignment transform are computed from identical inputs; only unconsumed writes disappeared.

## Alternatives considered

- **Migrating background-position stepping to composited transform-only animation**: rejected here - the alignment offset already rides transform, while the atlas stepping is inherently a repaint (R3 records why); switching techniques would change rendering semantics for marginal gain and violate "visual parity first".
- **Pausing the loop when idle**: rejected - the character's whole purpose is ambient feedback; reduced-motion and hidden-tab pauses already exist.
- **Leaving the dead writes and optimizing only dsh-pet**: rejected - both systems were measured in the same 20 s window; halving this writer's surfaces is free, guarded, and covered by tests.

## Consequences

- Write surface drops from eight setProperty calls + two attribute writes per tick to two guarded setProperty calls plus one status-only attribute update; measured effect on the ~93 recalcs/s storm is expected roughly proportionally and will be recorded when a rebuilt GUI can be exercised (installed skins serve copies; a reinstall/restart gates live verification, same as the dsh-perf attribution build shipped the same day).
- Future readers must not reintroduce variable mirroring between container and sprite: if a stylesheet ever needs container-scoped values again, they must land together with their consumer.

## Testing

- `tests/orca-link-hooks.spec.ts`: status mirror assertion kept; added explicit assertions that the sprite carries `--orca-status-x` while the container carries no `--orca-status-column`. Full package suite passes (585/585); hooks.mjs syntax-checked; live-GUI before/after numbers deferred behind the reinstall gate noted above.
