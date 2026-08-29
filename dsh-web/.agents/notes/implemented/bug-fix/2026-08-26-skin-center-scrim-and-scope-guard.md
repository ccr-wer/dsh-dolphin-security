# Agent Note: Skin Center Scrim Governance and Settings Scope Guard

Status: implemented

## Problem

1. (#1178) `skin-controller.ts` had hardcoded `style.setProperty('--dsh-skin-scrim', '0')` / `'1'` in `setBackgroundLayer`, clobbering the user's custom `--dsw-skin-scrim` opacity configured in `BackgroundController`. When a skin was switched or when wallpaper suppression flipped, the user's custom occlusion was overwritten to 0 or 1.
2. (#1184) When another plugin broadcast `settings/document-updated` (e.g. changing model writing `agent-default-model`), `reconcileSkinBackgroundScope` in `background-scope.ts` needed explicit defense to ensure empty user layers are never accepted as patches to avoid clobbering the v2 active state with default settings.

## Decision

1. In `packages/skins/skin-center/src/client/runtime/skin-controller.ts`, removed all hardcoded scrim variable overwrites in `setBackgroundLayer`, keeping `--dsw-skin-scrim` under the sole authority of `BackgroundController`.
2. In `packages/skins/skin-center/src/core/background-scope.ts`, strengthened `reconcileSkinBackgroundScope` to explicitly reject empty user layers (`currentUserJson === ''`) so unrelated settings changes never patch v2 active state.
3. Updated unit tests in `skin-runtime.spec.ts` and `background-scope.spec.ts`.

## Consequences

User-configured background opacity is preserved across all skin/wallpaper state changes, and unrelated settings changes no longer risk overwriting custom backgrounds.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-skin-center test` (560 passed), `pnpm typecheck`, and `pnpm test`.
