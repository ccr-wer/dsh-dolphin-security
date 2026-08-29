# Agent Note: orca-link v2 skin port from dsh-deep-whale

Status: implemented

## Problem

The dsh-deep-whale repository (Small-tailqwq/dsh-deep-whale) ships two
whale-girl skins for the DSH web GUI as v1 cordis plugins with heavy client
code (maid-atelier and orca-link). maid-atelier was already ported into the
v2 skin collection with the author cooperating; the user asked to bring
orca-link in as the full version (all behaviors, not a static-layer cut) and
wanted the license chain confirmed first. The author confirmed inclusion is
allowed under CC BY-NC-SA 4.0, which is also the artwork holders' condition
(whale-girl original by 上善; the port's attribution chain is 上善 →
Small-tailqwq per the upstream NOTICE).

## Decision

Port orca-link from its v1 plugin shape to a v2 pure-asset skin at
`packages/skins/skin-center/skins/orca-link/`, faithful to the upstream
runtime behavior: scene hero/active crossfade driven by
`body[data-orca-scene]`, the 8x10 status-character atlas actor with
per-status frame pacing and centroid alignment, the sidebar wordmark and
link signal chip, the hero headline typewriter, composer scroll-intent
motion and drag-to-collapse, the rectilinear icon redraw, the Beijing-time
pricing traffic light, terminal/AppFrame transition width locks, the
window-resume tooltip suppression, settings/cordis overlay attributes and
rail-search completion. `scripts/dsh-skin-migrate-v2.mjs` provided the
mechanical groundwork (CSS extraction, hashed-class rename to
`orca-ch-*`, asset extraction for the five used art constants, manifest
draft); the hooks implementation is a full manual port under the trusted
SkinHooks contract (no top-level side effects, per-activation state, one
idempotent cleanup that restores every body attribute, inline style and
owned node). The v1 customization panel (character/background/pricing
toggles, SFW schedule) has no v2 settings surface, so every feature ships on
and the hidden-state CSS anchors stay for a future surface. License and
attribution ship in the skin directory (LICENSE/NOTICE) and in the manifest
(license/licenseUrl/noticeUrl/attribution); capture-previews now runs orca
hooks for gallery screenshots; gallery manifest and market dist were
regenerated (the skin appears in the Workshop store with its LICENSE/NOTICE
files). The token-audit parser defect surfaced by this port is tracked in a
separate bug-fix note.

## Alternative considered

A static-only port (token remap + backgroundMedia + patches) was rejected:
ORCA LINK's identity is its hook-driven scene and character states, and the
cut-down version would ship a different product. A community-index listing
of the upstream GitHub install was also rejected: the user asked for the
skin to be genuinely in our collection, which the author's cooperation and
CC BY-NC-SA terms both permit.

## Consequences

The ported hooks.mjs is trusted escape-hatch code reviewed and released
with the skin-center, so every future hook change needs the same review
path; the skin depends on DSH DOM anchors (`data-phase`,
`data-conversation-scroll`, `data-chat-flow`, composer seats, data-slot
sidebar) and needs regression passes per DSH shell update — the maid-atelier
port has already required four compat fixes after landing. CC BY-NC-SA 4.0
is a standing constraint: the skin may not be sold, bundled into anything
monetized, or combined with use that violates attribution, non-commercial
or share-alike terms; the project must remove or renegotiate it before any
commercial use of the distribution.
