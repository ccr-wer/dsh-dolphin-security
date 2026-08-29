# Agent Note: Re-add dsh-miku-pet with completed review evidence

Status: implemented

## Problem

PR #1031 re-introduced the dsh-miku-pet plugin package after the repository removed it (see [Remove dsh-miku-pet](../../../simplification/2026-08-24-remove-dsh-miku-pet.md)). The removal cleaned the standalone package, aggregate row, community index entry, and Workshop metadata; the re-added contribution is an in-repo package registered in the dsh-web-all aggregate (19 rows, 18 deps). The maintainer review required three items before acceptance: a same-origin fence on the /miku-pet/config write routes with route-level tests, a documented Hatsune Miku character-rights boundary, and real DSH GUI evidence.

## Decision

The package is accepted and merged (squash, ef0cbe88) with the completion work:

- Host write fence: /miku-pet/config PUT/DELETE now pass the shared loopback fence (packages/dsh-miku-pet/src/loopback.ts synced from shared/host/loopback.ts; scripts/sync-shared.mjs MANIFEST and the sync copy tests updated). Route-level tests (tests/config-fence.spec.ts) prove cross-site / foreign-Origin / non-loopback requests get 403 without touching disk and same-origin writes and deletes succeed.
- Rights boundary: NOTICE.md states the Hatsune Miku character name, image, and likeness belong to Crypton Future Media, INC. and that character usage follows the Piapro Character License (piapro.net links); the package claims only the contributor's original artwork per its LICENSE, and the README license sections (paired) carry the same boundary. Crypton approval for commercial redistribution is not asserted; it is documented as the redistributor's verification item.
- GUI evidence: an isolated scratch DSH instance (family tarballs from the completed branch, dsh web on an unused port) verified desktop rendering and frame animation, hover menu and stats, shop modal open/close, drag with localStorage persistence, settings save (config written) and reset (config cleared), narrow 390x844 viewport, and zero page/console errors. Evidence archived in docs/archive/miku-pet-pr-1031/.
- Semantic-attrs parity: the client renders data-dsh-part anchors (sprite/menu/stats/shop/bubble/float) and the contract row for the sprite anchor was corrected to a descendant selector.

## Alternatives considered

- Reject the contribution over rights: rejected for this run because the requested evidence format was documentation of the character boundary plus the official terms link and the author statement (both delivered), with the unverifiable part (Crypton permission for a given use) kept as an explicit boundary rather than an assertion.
- Integrate the package without the aggregate row or as a community plugin instead of an in-repo package: rejected, the completed version keeps the prior in-repo shape (aggregate row, mount-once coexistence).

## Consequences

dsh-miku-pet is again part of the shipped plugin family with documented rights boundaries and guarded write routes. The removal note above remains as the historical record (its surface-cleanup rationale was fully carried out before this re-add). Community index and Workshop metadata are unaffected (the package is not a community entry).