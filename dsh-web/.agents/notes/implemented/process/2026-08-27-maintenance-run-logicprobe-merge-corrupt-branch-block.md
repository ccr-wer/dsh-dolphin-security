# Agent Note: Maintenance run merges logicprobe update and blocks corrupted delete-message branch

Status: implemented

## Problem

The third 2026-08-27 /pr-issue-maintenance run re-checked the five open pull requests of zhu1090093659/dsh-web under the default scope (assignees explicitly include zhu1090093659; issues excluded): #1208, #1185, #1144, #1100, #1098. Every formal review on file was from this account itself, so the collaborator-reviewed read-only rule did not apply anywhere. Two questions drove the run: whether the post-review pushes on #1208 and #1185 actually answered the pending CHANGES_REQUESTED items, and what had changed on the other three. The [milestone/logicprobe note](2026-08-26-maintenance-run-milestone-merge-logicprobe-review.md) and the [six-pr note](2026-08-26-maintenance-run-community-index-six-pr-round.md) hold the earlier rounds on the same queue.

## Decision

- PR #1208 (dsh-logicprobe description update): APPROVED and rebase-merged into dev as 722050b36. The new head commit adds the regenerated market/dist/manifest/plugins.json whose descriptions match community.json exactly, resolving the original stale-manifest blocker; the body now says 0.5.x and carries community-index / market-build / market-build --check output; the required contribution-evidence boxes are checked and checks are green. The author also fixed the previously recorded upstream advisory items: peer deps aligned to rc.6, dsh.engines.dsh declared, test scripts given the executable bit, npm ci clean. Merge used gh pr merge --rebase, matching how earlier external index entries landed as linear commits while preserving contributor attribution.
- PR #1185 (dsh-delete-message): request-changes filed on grounds of a corrupted branch, replacing the earlier missing-manifest complaint. Local fetch showed the branch tip (fa0faf10b, pushed 2026-08-26 16:07 UTC) contains exactly one commit beyond its base, a pure rename of all 3307 tracked paths that appends a carriage-return control character to every top-level directory name (packages<CR>/, market<CR>/, .agents<CR>/): git diff --stat reads 3307 files changed, 0 insertions(+), 0 deletions(-), and no plain directory names remain in the tree. The registration itself is gone: git grep finds dsh-delete-message only inside a notes file, never in community.json. Trees carrying CR paths predate this author, so the damage came from an earlier sync of an affected checkout. The review tells the contributor to start over from latest origin/dev rather than patching: recreate community.json plus the regenerated market/dist/manifest/plugins.json and paste node scripts/community-index and node scripts/market-build --check output into the PR body.
- PRs #1098, #1144, #1100 stay untouched in waiting-on-author state. After this account's follow-up comments (#1098: rebase plus subcategory, lockCommit surfaced in the install dialog, Windows and reproducibility evidence; #1144: upstream stability gate; #1100: session-cwd hardening) none of the three saw a new commit or reply, verified from commit timelines and issue-comment threads, so no re-review or bump was filed this run.
- Fork-gated workflow approvals were left standing; no fork workflow was started this round because no candidate reached that stage.

## Alternatives considered

- Closing #1185 outright as a damaged branch was rejected: closures must carry reasons and contributors deserve one repair attempt; the rebuilt-from-dev instruction keeps the contribution alive at zero merge risk.
- Merging #1208 by squash or merge commit was rejected because repository precedent lands external index contributions as rebased linear commits (for example 5ce48f011 for #1093) and maintainer work flows into dev by direct push; rebase keeps history uniform.
- Updating the two existing maintenance-run notes instead of adding this one was rejected: their first-round decisions stand unmodified, so the overlap is partial and handled by cross-linking per the supersession rules.

## Consequences

- dev carries the logicprobe 0.5.x descriptions at 722050b36; scripts/community-index and scripts/market-build consistency for it was exercised by green PR CI, and the post-merge pull shows only the two intended files changed.
- #1185 remains open and blocked until a rebuilt branch arrives; when it does, the earlier requirement (committed regenerated manifest plus check-output evidence in the body) still applies alongside inspecting the fresh head for stray control characters.
- Next run must re-read reply threads on #1098, #1144, and #1100 before acting again; nothing else may move meanwhile.
- Branch-tip content must be inspected locally whenever a PR pushes hundreds or thousands of renamed files; rename-only diffs have slipped past plugin-mount CI once already.

> 2026-08-27 later run update: #1185 returned as the clean single-commit rebuild f25166296 requested here and merged as 5e85b6ebc; follow-ups for #1100 and the parked items continue in [the five-PR round](2026-08-27-maintenance-run-delete-message-merge-four-registration-reviews.md).
