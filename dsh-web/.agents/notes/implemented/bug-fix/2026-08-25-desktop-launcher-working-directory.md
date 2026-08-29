# Agent Note: Desktop Launcher Shortcut Working Directory Isolation

Status: implemented

## Problem

When creating a desktop shortcut on Windows, `renderShortcutInstaller` set `$shortcut.WorkingDirectory` to the user's home directory (`~`). When DSH launched from the desktop shortcut, it loaded any `.env` file present in the user's home directory. If an unrelated application in the home directory created a `.env` containing bootstrap-only variables such as `DEEPSEEK_BASE_URL`, DSH aborted before binding to port 3080 with:
```text
dsh: <user-home>/.env sets "DEEPSEEK_BASE_URL", which only the launching environment may set
```
Because the desktop shortcut ran with hidden window and silent error handling, the process silently vanished without starting the web server.

## Decision

1. In `packages/dsh-desktop-launcher/src/core/launcher.ts`, allow `renderShortcutInstaller` to accept an explicit `workingDirectory` option (with `homeDir` as a legacy fallback).
2. In `packages/dsh-desktop-launcher/src/routes.ts`, pass `workingDirectory: scriptsDir` (`~/.dsh/desktop-launcher`), isolating the DSH launcher process in its dedicated directory.
3. Updated unit tests in `launcher.spec.ts` and `routes.spec.ts` to assert that `$shortcut.WorkingDirectory` points to the isolated `desktop-launcher` directory.

## Consequences

Launching DSH via the Windows desktop shortcut is now isolated from unrelated `.env` files in the user's home directory. Existing and newly generated shortcuts start cleanly without bootstrap environment variable collisions.

## Testing

`pnpm --filter @linxin666/dsh-desktop-launcher test` (54 passed), `pnpm typecheck`, `pnpm test`, and `pnpm test:scripts` all pass cleanly.
