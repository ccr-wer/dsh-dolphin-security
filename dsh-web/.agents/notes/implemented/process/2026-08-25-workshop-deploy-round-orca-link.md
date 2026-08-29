# Agent Note: workshop deployment round — orca-link store listing

Status: implemented

## Problem

The orca-link v2 port needed to become visible in the live Workshop
(https://dsh-market.com). The deployment round is the empirical procedure
future contributors should follow when any content change (skin, pet,
plugin) must reach the store: what was run, what was skipped, and how the
result was verified.

## Decision

Deployed the Workshop manually from the local checkout (the round's commits
were not pushed, so the CI path did not fire):

1. regenerate content: `node scripts/market-build` (verify with
   `pnpm market:check`; never rebuild in CI);
2. commit the regenerated `market/dist` with the change;
3. deploy with `node scripts/deploy-market --skip-redirect` — the
   gallery.dsh-market.com 301 ruleset already existed (publicly verified:
   `curl -sI https://gallery.dsh-market.com` → 301), and the redirect step
   would need `CLOUDFLARE_API_TOKEN`+account id which the local shell does
   not carry. The wrangler steps (D1 migrations + Worker + static assets)
   used the existing OAuth login instead.
4. verify: `curl https://dsh-market.com/manifest/skins.json` shows the new
   id (21 skins; orca-link carries its LICENSE/NOTICE files), and the store
   page lists the card with author/version/tagline.

Cadence rule: any later content change goes through the same
market-build → commit → deploy-market loop; the CI alternative (deploys on
dev pushes) is documented in
[2026-08-25-workshop-deploys-from-dev.md](../../implemented/process/2026-08-25-workshop-deploys-from-dev.md).

## Alternative considered

Pushing dev to trigger the CI deploy instead of a manual run was declined
for this round: reverting or staging the deployment is easier when done
deliberately with `--skip-redirect`, and the manual path also documents the
verification step explicitly.

## Consequences

The live store now lists orca-link (visible card) and its one-click install
carries official-market provenance; future rounds must remember that
market/dist is committed output (market:check fails on drift) and that
deploy-market is safe to re-run (D1 migrations idempotent, static assets
upserted by hash).
