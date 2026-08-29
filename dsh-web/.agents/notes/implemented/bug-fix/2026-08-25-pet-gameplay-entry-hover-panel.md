# Agent Note: Pet gameplay entry moves into the hover panel

Status: implemented

## Problem

For pets that declare the `gameplay` block (miku is the reference implementation), the entry to the gameplay card was a floating pill anchored below the sprite's bottom-left corner (`pet.module.css` `.gameplayToggle`). The hover panel (feed/rename/hide plus the affinity rows) also opens directly under the sprite, horizontally centered; the panel is at least as wide as the sprite box (min-width 148px against the 160px default box, and the nowrap affinity rows stretch it wider), so its left edge reaches into the pill's footprint, and being a later DOM sibling it also intercepts the clicks. The overlap appears when the pet is dragged high enough for the space below to fit the panel (at the default bottom dock the panel flips above the sprite); because the pill is part of the float container, hovering it opens the panel that then covers it — in that state the gameplay entry was unreachable.

## Decision

The gameplay entry now lives inside the hover panel. When the pet declares gameplay, the panel's action row gains a 玩法 action that opens/closes the gameplay card through a new `openCard` channel on the per-pet `GameplayBus` (`packages/dsh-pet/src/client/gameplay-hud.tsx`), registered by the HUD and called by the chrome — the same chrome -> HUD direction as `tap`. The floating pill is gone: the `.gameplayToggle` rules are deleted from `pet.module.css` and the card keeps its own close button. Chrome wiring: `PetSprite` renders the action only while `onGameplayMenu` is present, and `PetDockEntry` forwards it to `aux.bus.openCard?.()`; pets without a gameplay block keep the three-action panel unchanged. The gameplay card root still carries `data-dsh-pet-gameplay`; no semantic-attr contract change.

## Alternatives considered

- **Keep the pill, move it beside the sprite** (right edge, vertically centered): escapes the panel's band at any placement, but the pet can be dragged flush against the viewport edge where a side pill clips, so the anchor side would need measured flipping; and the pet keeps two competing chrome surfaces.
- **Hide the pill while the panel is open**: the pill is inside the hover container, so hovering it opens the panel first — hiding on hover makes the entry permanently unreachable, the opposite of the fix.
- **Offset the panel below the pill**: the panel is a content-sized floating card and the pet dock hugs the viewport bottom, so pushing the panel down pushes it off-screen or flips it above more often, moving the conflict instead of removing it.

## Consequences

One control surface per pet: feed/rename/hide and gameplay all live in the hover panel, and opening the card never requires first escaping an overlay. The panel grows one button for gameplay pets (four actions), which stays centered under the sprite. The client bundle must be rebuilt for the change to reach the browser.

## Testing

`pnpm --filter @linxin666/dsh-pet typecheck`, `test` (431 passed) and `build` all pass. The gameplay-hud tests drive the card through `bus.openCard` (card opens, no-argument toggle, explicit boolean, close button) and the PetSprite tests cover the panel action: rendered for gameplay pets, absent for pets without the HUD, kept when a voice pack hides every panel action. Live GUI verification pending a client-bundle reload.
