# Agent Note: Issue default assignee uses an Issue-only fallback

Status: implemented

## Problem

At the time this decision was made, the Issue creation workflow shared `defaultRoute` with PR routing. That route assigned unmatched PRs to the repository owner, while new Issues needed a collaborator as their default fallback. Reusing or changing the shared route would have altered PR assignment behavior.

## Decision

The earlier implementation defined `issueDefaultRoute.assignees` as `["Aa728848"]`. `.github/workflows/auto-assign-issues.yml` kept category matching first; when no Issue category route matched, it used `issueDefaultRoute`, then the hardcoded Aa728848 fallback if the configuration could not be read. The shared `defaultRoute` remained unchanged for PR routing. Existing Issue templates were not modified.

Recognized Issue categories therefore kept their route-specific assignees, while an Issue without a matching category was assigned to Aa728848. The workflow ran only for newly opened Issues, excluded pull-request payloads, and filtered the Issue author from the assignee list.

## Alternatives considered

- Change `defaultRoute.assignees` to `Aa728848`: rejected because the PR auto-assignment workflow consumes the same field and would move unmatched PR assignments away from the repository owner.
- Add `assignees` to every Issue template: rejected because template-level assignment would not represent a fallback and would bypass the existing category routing; the user had also already modified the templates.
- Ignore category routes and assign every Issue to Aa728848: rejected for this decision because it would replace an existing routing policy rather than change the default fallback.

## Consequences

The earlier implementation sent unmatched new Issues to Aa728848 and kept a hardcoded Aa728848 fallback when configuration could not be read. PR reviewer and assignee routing remained governed by the shared `defaultRoute`. The author-filter behavior left an Issue unassigned when its only configured assignee was the Issue author.

The rationale for keeping `defaultRoute` independent of Issue assignment remains part of the current PR routing policy.

## Supersession

[Separate Issue and PR assignment](2026-08-25-issue-pr-assignment-separation.md) supersedes the Issue assignment behavior recorded here. Current Issue routing assigns every opened Issue to `Aa728848` without category matching or author filtering, and the stale-assignment workflow processes PRs only. The current configuration no longer contains `issueDefaultRoute` or Issue-specific `issueTypes` metadata; `defaultRoute` and route-level assignees remain PR-only.
