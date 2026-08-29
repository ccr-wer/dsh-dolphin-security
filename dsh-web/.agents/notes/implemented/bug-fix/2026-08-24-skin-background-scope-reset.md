# Agent Note: Skin background scope reset protection

Status: implemented

## Problem

Issue #1107 reports that moving the whale pet or switching models can reset the Skin Center background occlusion to 0%. The legacy `skin-background` settings scope publishes a schema-resolved section when any settings document changes, while the Skin Center v2 active-state document is the authoritative background store. Treating the resolved section as a complete replacement lets the schema default `backgroundOpacity: 0` overwrite a persisted value such as 100.

## Decision

Keep the legacy scope as the loopback settings-page input, but reconcile it as a revision-fenced, raw-user-field patch. A publication with no namespace revision or the same revision is ignored. The reconciliation reads `snapshot.user`, filters and normalizes only known explicitly stored fields, merges the resulting patch into the live v2 background, and never replaces absent fields with schema defaults. An explicitly stored default remains an intentional user choice.

## Consequences

Unrelated pet or model settings commits no longer change the live background or write a default-filled background document. Official settings-page edits to explicitly stored background fields continue to apply, while fields absent from the legacy user layer remain controlled by the v2 state. The pure reconciliation helper is covered by regression tests for revision fencing, customized non-opacity fields, explicit defaults, and malformed input.

## Verification

- `pnpm --filter @linxin666/dsh-client-ui-skin-center typecheck`
- `pnpm --filter @linxin666/dsh-client-ui-skin-center test -- --run tests/background-scope.spec.ts` (31 files, 547 tests passed)
- Skin Center package build completed through the workspace prepare step.
- Live GUI verification after the user-managed DSH service restart loaded the rebuilt bundle, set background occlusion to 100%, dragged the rendered whale pet, and observed the control, `--dsw-skin-scrim`, and `/api/skin-center/v2/active` all remain at 100%.
