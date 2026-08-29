# Agent Note: Gameplay card opens beside the pet

Status: implemented

## Problem

The gameplay card anchored at the pet's feet and grew upward over the sprite (`transform: translateY(calc(-100% - 20px))`), so with four stat bars, action buttons and the shop grid the card (roughly 180-260px tall against a 160px sprite box) rose past the sprite's top into the band above it — the band the session/status bubble stack occupies, centered over the sprite with intentionally wide pills. The card and a wide bubble overlapped, covering the bubble and the card's own lower buttons (the 钱包 button under the pill in the report). The earlier change that moved the gameplay entry into the hover panel ([pet gameplay entry moves into the hover panel](../../bug-fix/2026-08-25-pet-gameplay-entry-hover-panel.md)) fixed the entry collision; this was the remaining card-vs-bubble collision, and growing the card downward instead would have hit the hover panel the same way.

## Decision

The card now opens BESIDE the sprite instead of above it. `GameplayHud` measures its parent float box and its own width in a layout effect: the card is vertically centered on the sprite box, its max-height is clamped to the sprite's height (content scrolls inside when taller), and the side is picked by the space available — right when `innerWidth - parent.right >= width + 8`, otherwise left (a pet parked near the right viewport edge, the default bottom-right dock, flips the card to the left). Placement happens through direct style writes on the card (transform + max-height), the same direct-DOM pattern the status ornament uses; the CSS keeps only pre-measure fallbacks. The card therefore never enters the bubble band above the sprite or the hover-panel band below it, for any pet position, size, or card page.

## Alternatives considered

- **Keep the upward card and shift it horizontally**: the collision is vertical (the card is taller than the sprite), so a horizontal shift only helps when the bubble is narrow; the status pills are intentionally wide, so this does not close the bug.
- **Clamp the upward card to the sprite height**: the card still sits on top of the sprite art and its top lands exactly in the bubble zone (bubbles hug the sprite's top edge), so the pill remains hit.
- **Open the card to the side without a height clamp**: a card taller than the sprite pokes past both bands when centered, reintroducing overlaps on the busiest pages (shop grid).

## Consequences

The gameplay card and the pet's bubbles/panel are never in each other's way, for any dock position and any of the card's pages; the card scrolls internally when its content exceeds the sprite height (common on the shop page below ~200px pets). The placement lives in the float's local space, so the card follows the pet when dragged; the side choice is re-evaluated on window resize while the card is open. The client bundle must be rebuilt for the change to reach the browser.

## Testing

Package typecheck/test/build pass; two placement tests mock the float and card rects (right side when the space allows: `translate(168px, -80px)` with max-height 160px; left flip when the pet is flush right: `translate(-248px, -80px)`). Live GUI check at http://127.0.0.1:3080: the card measured left of the sprite (206x154, within the 160px sprite band, vertically centered within 1px) with the status bubble above and the hover panel below both fully clear; the side is position-driven, so the bottom-right dock normally shows the card on the left.
