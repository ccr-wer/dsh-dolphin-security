# Agent Note: dsh-perf client export fix

Status: implemented

## Problem

`dsh --profile web` fails before the Web UI starts with `client-modules: 1 client package failed to compose`: `@linxin666/dsh-perf` declares `dsh.client.platform: "web"` but its `package.json` does not export `./client`. The official client-modules loader resolves the declared browser half through `exports["./client"]`, so the missing subpath is treated as a plugin composition error even though `lib/client.js` already exists.

## Decision

Add the standard client subpath to `packages/dsh-perf/package.json`:

- `"./client"` maps types to `./lib/types/client/index.d.ts` and runtime to `./lib/client.js`.
- Keep the existing `dsh.client` declaration unchanged; the browser HUD remains part of the package.
- No profile or dependency change is required because the profile depends on the checkout through a pnpm link.

## Alternatives considered

- **Remove the `dsh.client` declaration**: rejected. It would disable the HUD and make the declared `dsh-perf` feature silently host-only instead of fixing the package contract.
- **Use a plain string export**: rejected. The repository family convention uses the conditional object with a `types` entry, and the loader accepts that form directly.

## Consequences

The profile plugin tree can compose normally. The boot graph advertises `@linxin666/dsh-perf`, the client bundle is served from the expected URL, and users can rerun `dsh web` without editing the profile. The existing package contract now matches the other client-bearing dsh-web packages.

## Verification

- `pnpm --filter @linxin666/dsh-perf build`: both host and client bundles built successfully.
- `pnpm --filter @linxin666/dsh-perf typecheck`: passed.
- `require.resolve("@linxin666/dsh-perf/client")` resolves to `packages/dsh-perf/lib/client.js`.
- `dsh --profile web --no-open --port 0` starts, returns HTTP 200, and serves `/plugins/@linxin666/dsh-perf/client.js` with HTTP 200; the temporary verification server was stopped afterwards.
