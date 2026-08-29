# Agent Note: fix orca-link composer seat binding assignment scope

Status: implemented

## Problem

When the Orca Link (`orca-link`) skin was active, opening the settings dialog caused the settings modal to appear covered by the conversation composer card floating in the foreground (issue #1200, Small-tailqwq/dsh-deep-whale#85). The root cause was a JavaScript scope defect in `packages/skins/skin-center/skins/orca-link/hooks.mjs`: `mountBinding` declared `const binding = bindings.get(seat)` and, when `binding` was `undefined` on first mount, stored the newly created record in `bindings.set(seat, created)` without reassigning the local `binding` variable. Subsequent property access on `binding.handles` threw a `TypeError`, causing the skin controller's safety fallback to catch the error (`hooks failed for orca-link; static skin stays active`) and aborting the remainder of `apply(ctx)`. As a consequence, `settingsOverlayDisposer` was never registered, `body[data-orca-settings-open]` was never set when opening settings, and the settings modal remained un-elevated below the active composer and floating surfaces.

## Decision

`mountBinding` in `packages/skins/skin-center/skins/orca-link/hooks.mjs` rebinds `let binding` and assigns the created seat binding directly to the local variable so subsequent handle creation and phase checking succeed. DOM constructor lookups (`Element`, `HTMLElement`, `SVGElement`, `HTMLInputElement`, etc.) are resolved safely against the active `window` / `document.defaultView`. A regression test in `packages/skins/skin-center/tests/orca-link-hooks.spec.ts` verifies that mounting composer seats with conversation flows creates drag handles without throwing and that `body[data-orca-settings-open]` correctly synchronizes with the settings dialog lifecycle. The reviewed hooks registry and market distribution artifacts are updated.

## Alternatives considered

Handling the modal elevation purely with generic CSS rules without `data-orca-settings-open` was rejected because the Orca Link skin design depends on dynamic layout state to suppress floating chrome (spines, standby indicators, character bubbles, and composer docking) while the settings overlay is open. Catching the error inside `mountBinding` without fixing the assignment was rejected because it would silently leave the composer handles unmounted and break drag collapse functionality.

## Consequences

Orca Link hooks mount cleanly without runtime exceptions during initial page load and session transitions. When settings is opened, `body[data-orca-settings-open]` is correctly applied, allowing `patches.css` to elevate the modal layer and suppress conflicting foreground widgets. The skin controller error is resolved and all dynamic hooks continue running.
