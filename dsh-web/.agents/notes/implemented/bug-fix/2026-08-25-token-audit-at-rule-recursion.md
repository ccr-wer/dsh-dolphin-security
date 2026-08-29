# Agent Note: token-audit at-rule recursion bound

Status: implemented

## Problem

`auditTokenContract` (skin-center css-safety/token-audit.ts) scans
custom-property definitions via `parseDefinitions`, whose at-rule branch
recursed with `visit(open + 1)` and no block boundary. The nested scan
therefore re-walked every remaining block of the stylesheet for every
at-rule; on nested at-rule chains (`@media` > `@supports` >
`@container` > `@keyframes`, the shape a v1 CSS-modules bundle keeps
after migration) the traversal became exponential — auditing the migrated
orca-link patches.css took ~126 s and the `dsh-skin validate` / check gates
hang on any such skin.

## Decision

Bound the at-rule recursion to the at-rule's own closing brace:
`visit(start, limit, ...)` with `limit` capped at the enclosing close
(and closes that would escape the limit treated as unbounded, delegating the
remainder to the outer scan). Nested token extraction keeps working — inner
blocks are still walked — and the total scan returns to linear. Regression
coverage added in css-safety.spec.ts: a nested @media/@supports/@keyframes
chain completes in bounded time, the nested `button-primary-fill` is still
found (no missing-anchor warning), and no contrast warning appears.

## Alternative considered

Flattening the generated CSS instead (lightningcss still emits nested
@media pairs, so the pathological input remains) and doing nothing (gates
stay unusable for any skin with migrated nested at-rules — a latent CI
hang for future community transplants) were both rejected.

## Consequences

The audit remains warning-only and behavior-compatible; only the traversal
cost changes. Any future stylesheet shape with deep at-rule nesting now
completes; the regression test keeps the bound from silently regressing.
