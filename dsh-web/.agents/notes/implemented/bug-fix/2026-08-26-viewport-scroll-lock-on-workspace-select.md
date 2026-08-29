# Agent Note: Viewport Scroll Lock and Root Box-Sizing for Workspace Selection

Status: implemented

## Problem

When selecting or switching a workspace in the DSH Web UI (such as clicking the workspace dropdown `@ Workspace write`), the page viewport scrolled downward unexpectedly. The top titlebar and sidebar top were displaced offscreen, `#root`'s bottom border moved to the middle of the viewport, and a large black void appeared at the bottom with a global window scrollbar. This occurred because `html` and `body` lacked `overflow: hidden`, while `#root` in skins like `matrix` had `border: 1px solid` without `box-sizing: border-box`, creating a minor overflow that browser `focus()` / `scrollIntoView()` scrolled to the bottom.

## Decision

1. In `packages/skins/skin-center/src/client/runtime/shell-rendering.ts`:
   - Added active-visual-scoped rules locking `html, body` to `height: 100% !important; width: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important;`.
   - Added active-visual-scoped rules locking `[id="root"]` to `box-sizing: border-box !important; height: 100% !important; width: 100% !important; max-height: 100% !important; overflow: hidden !important;`.
   - In `installShellRenderingAdapter()`, invoked `doc.defaultView?.scrollTo?.(0, 0)` to reset any preexisting viewport scroll offset on mount.
2. In `packages/skins/skin-center/skins/matrix/patches.css` and `minecraft/patches.css`, ensured `[id="root"]` specifies `box-sizing: border-box; height: 100%;`.
3. Updated unit tests in `packages/skins/skin-center/tests/skin-runtime.spec.ts` to verify the viewport constraints.

## Consequences

The page maintains a fixed 100% viewport without outer scrollbars, and switching/selecting workspaces no longer triggers layout shifts or viewport displacement.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-skin-center test` (567 passed), `pnpm skin-center:check`, `node scripts/market-build`, `pnpm market:check`, `pnpm docs:check`, `pnpm aggregate:check`, and `pnpm typecheck`.
