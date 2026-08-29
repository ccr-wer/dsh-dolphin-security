# Agent Note: Large cohesive units flagged for future splitting (deferred)

Status: proposed — awaiting user approval for a dedicated refactor effort; no code changed

## Problem

A duplication/maintainability audit flagged five oversized units as god-function/god-unit risks: `packages/skins/skin-center/src/pkg-extract.ts` (2,743 lines; the whole PKG/TEX/LZ4/PNG codec stack plus scene extraction), `packages/skins/skin-center/src/we-routes.ts` (963 lines; Wallpaper Engine route tree), `packages/skins/skin-center/src/client/SkinCenter.tsx` (707 lines), `packages/dsh-plugin-manager/src/host/gateway.ts` (885 lines; CliGateway), and `packages/dsh-pet/src/service.ts` (843 lines; PetService).

## Proposal

Split each unit along its internal seams as separate, individually reviewed changes: pkg-extract into codec (png/lz4/tex/pkg) vs scene-extraction modules; we-routes into per-surface route tables; SkinCenter into panel components; CliGateway into route handlers grouped by domain; PetService into state store vs render-loop pieces. Each split should ship with its own Agent Note and pass the owning package's full gate set.

## Alternatives considered

Implementing the splits inside the code-optimization run was rejected: size alone is not evidence of a defect — these units are cohesive (pkg-extract is a codec library; the routes files are tables) and carry no correctness, performance, or duplication finding. Large structural rewrites without a driving defect violate the minimal-change rule and concentrate regression risk across five packages at once.

## Consequences

No code changed in this run. The list above is the agreed backlog if a future effort takes up structural splitting; each item needs its own proposal review before implementation.

## Evidence

Line counts measured at dev 5a4278fbc (wc -l); the audit's original numbers (719/687/610/653/595) were per-function/class spans and are superseded by the file-level measurements here.
