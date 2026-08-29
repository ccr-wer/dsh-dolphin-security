# Agent Note: Local checkout directory renamed to dsh-web

Status: implemented

## Problem

The development checkout lived at `/Users/zcl/code/dsh-web-ui` while the remote, docs, and skills already speak of `zhu1090093659/dsh-web` (see [product rename](../architecture/2026-08-24-product-rename-dsh-web.md)). The stale folder name kept drifting local runbooks, test fixtures, and release commands away from reality.

A bare `mv` is not enough: references reach outside the repository. DSH profiles mount packages through symlinks whose targets climb into the old path (`~/.dsh/profiles/**`, dozens of links), an external linked worktree registers this repository's gitdir by absolute path, and tracked texts embed the old absolute path. After a move without preparation, running DSH instances lose plugin resolution on their next lazy load or restart, and the external worktree dies.

## Decision

- The checkout lives at `/Users/zcl/code/dsh-web`. A temporary compatibility symlink kept consumers resolving through the move; the follow-up cleanup re-pointed every DSH profile dependency (profile manifests with their pnpm-lock files, pnpm `.package-map.json` copies, and all 79 profile package links) to the new root and removed the symlink, so `/Users/zcl/code/dsh-web-ui` no longer exists.
- The external worktree `/Users/zcl/remote-e2e/pr-970` had its `.git` pointer rewritten to the new location, so it no longer depends on the compatibility symlink. The leftover temporary push worktree under `/private/tmp` was pruned from the registry.
- Tracked texts were updated in the same change: the release skill runbook path and its `cd`, the dsh-pet install example comment, and the plugin-manager legacy-migration fixtures representing this machine's checkout path.
- Frozen runtime identifiers stay untouched: `@linxin666/dsh-web-ui-all` npm names and telemetry/product strings follow the [product rename](../architecture/2026-08-24-product-rename-dsh-web.md) boundary and are not swept up by this relocation.
- The leftover local remote `java-lw` pointing at JAVA-LW/dsh-web-ui was removed; `origin` remains the only remote.

## Testing

- Immediately after the move: `git status` clean on `dev`, both stashes intact, the worktree list healthy, and an HTTP probe of the live GUI on port 3080 returned 200.
- After the cleanup: no reference to the old path remains in active profile configs; every previously-valid profile symlink still resolves (a 2821-link validity baseline showed no regressions after symlink removal); live dependencies (`dsh-perf`, `dsh-web-all`, `dsh-liangshen`) resolve directly from the new root.
- `vitest run tests/gateway-jobs.spec.ts tests/update-route.spec.ts` passes for `@linxin666/dsh-client-ui-plugin-manager`.

## Alternatives considered

One-shot full migration without the compatibility symlink: immediately rewrite every profile dependency specifier and reinstall each affected DSH profile right after the move. Rejected for this change: consumers span several profiles with mixed relative-link origins, and rebuilding them while the GUI is running risks breaking plugin loading between steps; the symlink achieves identical resolution with zero runtime exposure and defines its own removal condition.

Leaving the directory named `dsh-web-ui` indefinitely: rejected — the mismatch perpetuates wrong-path drift in skills, fixtures, and documentation, against the direction already recorded by the product rename.

## Consequences

- Git history, branches, tags, and stashes are unaffected by the move; no commit was rewritten.
- The compat-symlink escape hatch has been fully consumed: profiles point straight at `/Users/zcl/code/dsh-web`, so future work needs no legacy-path awareness. Inert leftovers deliberately stay untouched: historical task-board prompts, `.bak*` snapshots, session storages keyed by the old cwd, a baked-in build comment inside an installed `dsh-tool-describe-image` copy, and skin links that already dangled before the relocation.
- New sessions should bind to `/Users/zcl/code/dsh-web`; session storages keyed by the old cwd are historical records and need no migration.
