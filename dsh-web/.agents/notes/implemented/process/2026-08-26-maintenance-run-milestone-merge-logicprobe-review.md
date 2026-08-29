# Agent Note: Maintenance run merges dsh-milestone and reviews dsh-logicprobe 0.5.x

Status: implemented

## Problem

The second 2026-08-26 /pr-issue-maintenance run continued over the open pull-request queue of zhu1090093659/dsh-web under the default scope (PRs whose assignees explicitly include zhu1090093659; issues excluded). Six PRs were open, all of the mandatory-review type "register a third-party plugin in the community plugin index". Five carried CHANGES_REQUESTED reviews from this account from the earlier rounds; #1208 (dsh-logicprobe description update) had never been reviewed. No formal review from any other collaborator exists on any of the six, so the collaborator-reviewed read-only rule did not apply. The open questions: whether #1093's claimed follow-up fixes were real, and why #1208's CI failed.

## Decision

- PR #1093 (dsh-milestone): APPROVED and squash-merged into dev as 5ce48f011. All four items from the prior CHANGES_REQUESTED were independently verified: a clean clone of upstream main (e4037c1) passes 397/397 tests and typecheck; upstream CI run 32965289576 is 6/6 green across ubuntu/macos/windows x Node 22/24; four real GUI coexistence screenshots are committed under qa/screenshots/; the PR diff is exactly community.json + market/dist/manifest/plugins.json with a consistent entry (subcategory: chat) and merges conflict-free into dev 05641860. The approval notes three non-blocking text inaccuracies for follow-up: the test fix is commit e4d6230 while 3bc2a64 is only the pnpm-11 CI follow-up; the "first CI run 6/6 green" wording hides a failed first attempt; the PR body's "5 files changed" text is stale (the diff has 2).
- PR #1208 (dsh-logicprobe 5.0 registration update): CHANGES_REQUESTED. The diff updates only the entry descriptions and never regenerated market/dist/manifest/plugins.json; CI run 32945877245 fails exactly on market-build --check reporting manifest/plugins.json stale. The new description was verified against upstream 0.5.1 (README and package.json match: S1-S8/A1-A11, DS/DA/DD, regression, concurrency-risk mining) and upstream is actively maintained with green CI, so practicality is affirmed. The review also records: the "5.0" wording has no corresponding upstream version (npm latest is semver 0.5.1); upstream's peer ranges are self-contradictory (npm ci ERESOLVE without --legacy-peer-deps) and it still lacks a dsh.engines.dsh declaration — both advisory, not blocking.
- Fork-gated workflow runs approved so authoritative checks could execute: CI and agent-notes-guard for #1093 (32965845027, 32965844833) and #1098 (32700358128, 32700358142). All four went green; #1098 remains blocked on its standing contributor items (rebase + subcategory + manifest regeneration, lockCommit display in the confirm dialog, Windows and lifecycle evidence).
- PRs #1185, #1144, #1100, #1098: no action. Their heads are unchanged since this account's last review or comment, so every standing review item is verified unaddressed; the existing reviews stand without duplicate commenting.

Prior-round context: [maintenance run reviews six community-index PRs and unblocks dev CI](2026-08-26-maintenance-run-community-index-six-pr-round.md) and [maintenance run merges Skyrail Cabin and gates community-plugin evidence](2026-08-25-maintenance-run-skyrail-cabin-merge.md).

## Alternatives considered

- Request changes on #1093 for the three text inaccuracies: rejected because all four substantive review items were verified as landed, and blocking a merge on commit-attribution and stale-sentence trivia would misrepresent the actual risk.
- Merge #1093 without an approving review: rejected because the ruleset requires at least one approval and the approval is the reviewer's recorded judgment; bypassing it would hide the verification trail.
- Regenerate the stale market/dist manifest on the #1208 author branch from the maintainer side: rejected for the same reason recorded in the prior round — the missing regeneration is exactly the contribution-evidence discipline the index requires, and maintainer-side pushes into contributor forks would mask who validated what.
- Re-review all six PRs in batch: rejected because only #1093 had new commits since the last review round; re-reviewing unchanged heads would duplicate standing feedback.

## Consequences

origin/dev HEAD is 5ce48f011 and contains the dsh-milestone community-index entry (the index now lists 40 plugins); the dsh-market.com manifest picks it up on the next market deploy from dev. #1208 waits on the author to regenerate and commit market/dist; #1185, #1144, #1100, and #1098 each wait on their itemized contributor feedback. The dsh.engines.dsh declaration expectation is now stated publicly on both #1185 and #1208 and remains a candidate for the index documentation if it becomes a standing requirement.
