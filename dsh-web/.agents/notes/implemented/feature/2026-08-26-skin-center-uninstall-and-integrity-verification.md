# Agent Note: Skin Center user skin uninstall and integrity verification

Status: implemented

## Problem

Users installing skins from the Workshop or manual directories into `$DSH_HOME/skins/<id>/` previously had no in-GUI mechanism to remove installed skins or verify their on-disk files.
1. **No In-GUI Uninstall**: Removing an installed skin required manually navigating the filesystem and deleting `$DSH_HOME/skins/<id>/`. If a user uninstalled an active skin without reverting, subsequent page reloads could encounter missing skin errors or inconsistent active state.
2. **Provenance Tampering & Security Integrity**: User-directory skins execute custom JavaScript via hooks (`hooks.mjs`) or declare stylesheet resources. The skin-center runtime enforces strict fail-closed provenance gates (`dsh-market.provenance.json` SHA256 hashes or known reviewed hashes in `REVIEWED_SKIN_HOOKS`). When on-disk files are locally modified or corrupted (e.g. during manual testing), execution is blocked with 403 `hooks-require-review` without a clear diagnostic or batch inspection tool in the GUI.

## Decision

- **Integrity Verification & Auto-Repair Core & API** (`packages/skins/skin-center/src/provenance.ts`, `skin-repo.ts`, `routes-v2.ts`):
  - Added `verifySkinIntegrity` and `verifyAllSkinsIntegrity` to recursively scan all installed skins in the catalog against their manifest, `dsh-market.provenance.json` SHA256 hashes, or reviewed hook registry.
  - Added `repairSkinFromMarket`, `repairSkin` and `verifyAndRepairAllSkins`: automatically downloads and recovers pristine files from the official market origin (`https://dsh-market.com`) or local source tree, regenerating `dsh-market.provenance.json` and refreshing the catalog cache.
  - Mounted `POST /api/skin-center/v2/verify` (accepting `{ autoRepair: true }` and returning `repaired` list) and `POST /api/skin-center/v2/skins/:id/repair` guarded by `requireSameOrigin`.
- **User Skin Uninstall Core & API** (`packages/skins/skin-center/src/skin-repo.ts`, `routes-v2.ts`):
  - Added `uninstallUserSkin(id, opts)`: validates safe ID format (preventing directory traversal / path escapes), removes `$DSH_HOME/skins/<id>` atomically with `rmSync`, and evicts the catalog cache. Builtin skins (`origin === 'builtin'`) are protected and cannot be deleted (returns 400 `cannot-uninstall-builtin`).
  - Mounted `POST /api/skin-center/v2/skins/:id/uninstall` guarded by `requireSameOrigin`. If the uninstalled skin is currently marked as active in `active.json`, it automatically resets active state to stock (`null`).
- **GUI Controls & Feedback** (`packages/skins/skin-center/src/client/SkinCenter.tsx`, `skin-center.module.css`, `locales.ts`):
  - Header Toolbar: added "Verify Integrity" / "验证完整性" button next to the theme preview toggles. Clicking triggers full verification and automatic repair, displaying a success banner ("Successfully repaired N skin(s)") on auto-repair, and refreshing the active runtime.
  - Skin Cards: user skins display an "Uninstall" / "卸载" button with a two-step confirmation flow ("Confirm" / "确定" and "Cancel" / "取消"). Uninstalling an active or currently tried-on skin automatically reverts DOM state to official default first.
  - Integrity Status Badges: cards with verification reports show status badges (`badgeSuccess`, `badgeWarning`, `badgeDanger`) and detailed error notes (`integrityNote`) for tampered or missing files.

## Alternatives Considered

- *Client-only file deletion*: Not possible since browser client sandboxes cannot directly execute arbitrary filesystem deletions without server API endpoints.
- *Single-click instant uninstall*: Rejected in favor of a two-step confirmation UI to prevent accidental deletions of user customizations.

## Consequences

- Builtin skins shipped within the npm package remain immutable and read-only.
- Uninstalling cleans up both the disk folder and memory cache snapshot, allowing immediate UI re-rendering without full host daemon restart.
- Both new HTTP routes strictly enforce same-origin CSRF fences (`requireSameOrigin`).

## Verification

- Unit and Integration tests in `packages/skins/skin-center/tests/routes-v2.spec.ts` and `tests/skin-repo.spec.ts` testing successful uninstall, active fallback, traversal defenses, builtin protection, provenance verification, tampered file detection, and cross-origin rejections.
- Full workspace test suite (`pnpm test`) and typechecks (`pnpm typecheck`, `pnpm skin-center:check`, `pnpm docs:check`, `pnpm market:check`) all pass with 0 errors.
