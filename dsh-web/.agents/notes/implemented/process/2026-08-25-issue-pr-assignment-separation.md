# Agent Note: Separate Issue assignment from PR ownership

Status: implemented

## Problem

The Issue-opening workflow selected assignees from category routes shared with PR routing. Most category routes assign PR work to the repository owner, so category-matched Issues went to `zhu1090093659`; the generic stale-assignment sweep could also move inactive Issue work to the owner. The intended ownership boundary is all Issues to collaborator `Aa728848`, while the repository owner handles PRs.

## Decision

`.github/workflows/auto-assign-issues.yml` now treats Issue assignment as an independent policy. On an `issues: [opened]` event it ignores pull-request payloads and replaces the Issue assignee list with `["Aa728848"]`, without reading PR categories or filtering the Issue author. The workflow has no owner fallback.

`.github/workflows/stale-assignment.yml` now skips every item without a `pull_request` payload before checking activity or changing assignees. It may still move an inactive collaborator-assigned PR to the repository owner after 14 days, but it never moves an Issue to the owner.

`.github/pr-review-routes.json` is PR-only: its `defaultRoute` and route-level `assignees` continue to point allowed PR work to `zhu1090093659`, while renderer / WebGL PRs remain issue-only. The Issue-specific `issueDefaultRoute` and `issueTypes` metadata are removed because the Issue workflow no longer performs category routing. This supersedes the earlier [Issue-only fallback decision](2026-08-24-issue-default-assignee.md); its rationale for keeping `defaultRoute` independent of Issue assignment remains part of the PR policy. Existing Issue templates remain unchanged.

The open Issue backlog assigned to `zhu1090093659` is explicitly reassigned to `Aa728848` as part of this change; pull requests are excluded from that operation.

## Alternatives considered

- Keep category matching with an Issue-only fallback: rejected because route-level `assignees` are PR data and already assign most Issue categories to the owner; the default-branch copy can also lag behind the integration branch.
- Change every shared route assignee to `Aa728848`: rejected because `.github/workflows/auto-assign-pr-reviewers.yml` consumes those fields and would move PR ownership away from the repository owner.
- Leave the stale-assignment sweep generic: rejected because its owner escalation would undo the Issue collaborator rule after 14 days of inactivity.
- Repair only future Issues: rejected because the requested policy also covers already-open Issues assigned to the owner.
- Keep filtering the Issue author from the assignee list: rejected because the stated invariant is that every Issue goes to the collaborator, including an Issue opened by that collaborator.
- Add `assignees` to every Issue template: rejected because the event workflow is the single policy for API-created and template-created Issues, and template-level assignment would duplicate or bypass that policy; the existing Issue templates remain unchanged.

## Consequences

New Issues and the repaired open Issue backlog have one assignee, `Aa728848`; the assignment action fails instead of silently falling back to the owner if GitHub cannot assign that collaborator. Existing Issue templates remain unchanged. PR routing remains governed by `defaultRoute` and the route-level PR fields. There is no longer a category-based Issue assignment path or automatic stale Issue escalation.

## Testing

The workflow scripts and JSON configuration are validated as part of the focused repository checks. The GitHub API backlog query confirms the open Issue reassignment excludes pull requests and leaves PR ownership unchanged.
