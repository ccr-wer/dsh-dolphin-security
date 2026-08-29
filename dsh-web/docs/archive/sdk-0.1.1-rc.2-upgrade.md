# SDK upgrade to 0.1.1-rc.2 — handoff and validation record

Task: official SDK cohort upgrade for dsh-web-ui (dsh-sdk-upgrade + dsh-web-ui-sdk-compatibility).
One-off record; see [docs/AGENTS.md](../AGENTS.md) for the archive contract.

## Cohorts

- Baseline: host runtime dsh CLI 0.1.1-rc.1 (global npm install, /opt/homebrew); web profile tree 0.1.1-rc.1; repo SDK cohort ^0.1.1-rc.1 resolved to 0.1.1-rc.1.
- Target: host runtime 0.1.1-rc.2; web profile tree 0.1.1-rc.2; repo SDK cohort ^0.1.1-rc.2.
- Official channel: registry.npmjs.org. @deepseek-ai/dsh (the CLI app) dist-tags latest = 0.1.1-rc.2 (published 2026-08-21T12:42Z); family packages next = 0.1.1-rc.2 (published 2026-08-21T12:38Z). cordis 4.0.1, cosmokit 1.8.2, schemastery 3.18.1, cordis-plugin-include 1.0.6, cordis-plugin-loader 1.0.2 are unchanged latest-stable versions. No engines change; all family peers consistently move to ^0.1.1-rc.2.
- Repo git: branch upgrade/sdk-0.1.1-rc.2, based on origin/dev c08a5525. Commit 1: e7c6662bf (manifests, pnpm-workspace.yaml excludes, pnpm-lock.yaml). This commit 2 adds the contract annotations and this record.

## SDK delta (rc.1 -> rc.2), official dist comparison

Method: diff of the installed official package trees (pnpm store) for all 43 SDK packages; deep diff of every changed .d.ts / bundle consumed by the repository.

- Metadata: all 43 packages bump peer/dependencies ^0.1.1-rc.1 -> ^0.1.1-rc.2; exports, engines unchanged everywhere.
- Additive (no repo impact): dsh-attachment (ImageVariantId, ImageRequestPolicy, RequestImageAttachment, readImageRequest, validateImageBatch, ImageAttachmentRef.originalDimensions optional, ATTACHMENT_PROJECTION_UNSUPPORTED code); dsh-llm (content helpers textOnlyImageText, requestImageHandleText, RequestImageOffloadPolicy, projectImagesForTextModel, offloadRequestImagesWithPolicy; PreparedAdapterCall); dsh-client-connection (default maxRequestBodyBytes 160 -> 300 MiB, configurable).
- Removed (repo does not use; verified by grep, zero hits): reuseWorkspaceBlank from session.create across dsh-client-connection schema, dsh-client-runtime ISessions/IWorkspaces create, dsh-host-apiproxy sessions schema; dsh-client-ui-conversation locale keys access.preset.readOnly/workspaceWrite/fullAccess (label transform replaced by kebab -> title-case); dsh-llm attribution module (User-Agent identity helpers moved); dsh-host-apiproxy internal messagesHaveImage and refreshDefaultForReuse path.
- Behavior (host-owned): blank-session reuse semantics in client-runtime workspaces / host session.create changed; dsh-client-ui-conversation permission label rendering changed. Repo reads summary.blank in dsh-remote-web-ui, dsh-task-board, dsh-git-graph; the blank field and its semantics remain in rc.2 (sessionBlank predicate unchanged).
- Packaging: dsh-client-ui-slots has no ./client export in rc.1 or rc.2 (frozen static module); all other inject modules keep ./client.

## Consumer matrix result

- No source adaptation required. Every consumed type/value surface is unchanged or additively extended; the removed surfaces have zero repository usage.
- Contracts updated to pin the rc.2 cohort: shared/web-platform.ts, shared/tests/web-platform.test.ts, scripts/inject-contract.test.mjs (annotations and evidence comments; module lists unchanged and re-verified against the rc.2 dist).
- Static module table evidence (rc.2 dsh-web-frontend dist): same frozen set react, react/jsx-runtime, react-dom, react-dom/client, @deepseek-ai/cordis, @deepseek-ai/dsh-client-ui-slots, @deepseek-ai/dsh-client-ui-primitives; no new @deepseek-ai frozen modules.
- Inject composition evidence (rc.2 dsh-web-app cordis.patch.yml browser roster): rows for dsh-client-runtime, dsh-client-connection, dsh-client-locale, dsh-client-ui-conversation, dsh-client-ui-settings, dsh-client-ui-sidebar, dsh-client-ui-theme; dsh-client-ui-slots is a frozen static module of the shell.
- Peer warnings: 26 missing peers, identical package set to the rc.1 baseline; host-supplied runtime services by design (autoInstallPeers: false). Not a regression.

## Runtime rollout (outside the repo)

- Global dsh CLI upgraded to 0.1.1-rc.2 (npm install -g @deepseek-ai/dsh@0.1.1-rc.2); app tree verified at rc.2.
- Web profile ~/.dsh/profiles/web pins bumped to 0.1.1-rc.2 (dsh-client-ui-subagent, dsh-mcp-client, dsh-web-search-exa) with minimumReleaseAgeExclude reconciled; lockfile regenerated. Backups: package.json.bak-before-sdk-rc2-*, pnpm-workspace.yaml.bak-before-sdk-rc2-*, pnpm-lock.yaml.bak-before-sdk-rc2-* (20260821212122).

## Validation ledger

Commands run in the isolated worktree (branch upgrade/sdk-0.1.1-rc.2, commits e7c6662bf + 109397d1f + ledger amend):

- pnpm install --frozen-lockfile --ignore-scripts: PASS (CI resolution proof).
- pnpm peers check: 26 missing peers, identical set to rc.1 baseline (host-supplied by design).
- pnpm typecheck: PASS (all 19 workspace projects).
- pnpm gallery:check: PASS (16 skins).
- pnpm skin-center:check: PASS (16 built-in skins).
- pnpm community:check: PASS (36 entries, generated file in sync).
- pnpm build: PASS (all packages; aggregate lib/ regenerated byte-identical, nothing to commit).
- pnpm test: PASS (all workspace test suites).
- pnpm test:scripts: PASS (fail 0; includes inject-contract and shared-copy drift gates).
- pnpm runtime-deps:check: PASS (13 scanned packages).
- pnpm aggregate:check: PASS (dsh-skins 1 row, dsh-web-ui-all 16 rows).
- pnpm docs:check: PASS (all documentation gates).

## GUI verification checklist (pending host restart)

- State: global dsh CLI and web profile are at 0.1.1-rc.2 on disk; the RUNNING host process is still rc.1 (started 2026-08-21 17:00). The static frontend already serves the rc.2 bundle (index-ClqxG24t.js) because the host serves dist from disk. A restart of the managed dsh web host (`node ~/.local/bin/dsh web`; stop and start again in its terminal) is required before acceptance.
- After restart, verify on http://127.0.0.1:3080 (per dsh-web-ui-web-qa):
  1. Page loads and the app boots without console errors; confirm the served bundle is the rc.2 one.
  2. The dsh-web-ui sidebar entries and a representative plugin surface render (settings card, a host-backed view such as git-graph or task-board, a client slot such as chat-recovery turn tail).
  3. Host route mounting: exercise one loopback-backed route (e.g. dsh-ssh host list or dsh-skill-explorer list) and confirm 200/JSON without errors.
  4. No duplicate plugin id warnings in the host log; profile resolves @linxin666/dsh-web-ui-all through the repository link.
  5. One representative host-to-client workflow: open a workspace/session and confirm conversation slot rendering (dsh-client-ui-conversation permission label change is visible as kebab -> title-case).
- Post-integration: after the change lands on dev, rebuild affected artifacts in the shared checkout and refresh the link with node scripts/link-profile.mjs when needed.
