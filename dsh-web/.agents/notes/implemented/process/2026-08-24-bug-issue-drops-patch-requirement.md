# Agent Note: Bug issues drop the required patch

Status: implemented

## Problem

The bug issue form required reporters to include a proposed patch (`补丁`), and the issue-template enforcer closed reports without one. That made a reproducible bug report depend on the reporter already diagnosing and proposing a fix, which is not a reliable signal for maintainability and raises the barrier for casual reporters.

## Decision

Bug reports no longer have a patch field or require one. The bug form keeps screenshot evidence, smoke-test evidence, and code references as required fields, and the issue-template enforcer validates exactly those sections. `standard_issue.yml`, `CONTRIBUTING.md`, and `ISSUE_TRIAGE.md` now describe the same requirements without promising a patch.

Reporters are still free to attach a suggested fix in the supplementary context if they already have one.

## Alternatives considered

- Keep the patch field but mark it optional: rejected because the form should not invite a half-thought patch as part of the minimum bug report, and the requested behavior is explicitly smoke evidence only.
- Remove the code-reference requirement as well: rejected because code references remain a lightweight triage aid and were not part of the reported friction.
- Keep the template unchanged: rejected because the enforcer would continue closing otherwise complete reproduction reports.

## Consequences

The template and enforcer now accept bug reports with reproduction, screenshots, environment details, smoke-test evidence, and code references but no patches. Maintainers may need to ask for a patch later when a fix is required, introducing an optional follow-up tradeoff for contributors.
