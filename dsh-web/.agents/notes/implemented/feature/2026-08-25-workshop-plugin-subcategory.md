# Agent Note: Workshop plugin second-level classification

Status: implemented

## Problem

The Workshop plugin catalog carried only one classification level (
`category`: ui / tools / knowledge / integration / security / utility / agent). The
dsh-market.com site filtered plugins by category pills while the GUI Workshop card
showed the category as a card badge only and offered no filter at all. With 37
entries, users could not narrow the list along a second dimension, and the card's
raw-id badges ("integration") read as machine identifiers instead of label text.

## Decision

Add an optional second-level `subcategory` field to every
`packages/dsh-community-plugins/community.json` entry, validated by
`scripts/community-index` against a per-category enum (`SUBCATEGORIES`:
ui → terminal/chat/render/panel, agent → preset, tools → context/browser/api/model/dev,
knowledge → memory/reading/qa, integration → remote/bridge/sync/external-ai,
security → access/policy, utility → cleanup/stats/notify/net). `subcategory` is
accepted only when `category` is set; the `other` bucket (missing category) never
carries one. `scripts/market-build` passes `subcategory` into
`market/dist/manifest/plugins.json`.

Both Workshop surfaces render a two-level filter:

- dsh-market.com (market/src/app.js + index.html): the existing category pill row
  gains a second, smaller dashed pill row with counts, shown only after a category
  is selected; subcategories follow the canonical enum order; cards and the detail
  dialog list the subcategory label after the category label.
- The GUI Workshop card (packages/dsh-market): the plugins tab gets category and
  subcategory pill rows with counts (pure filtering logic extracted to
  `src/client/filter.ts`), and card badges switch from raw ids to localized labels
  (locale keys `category.*` / `subcategory.*`, zh and en; `categories.ts`
  maps ids to keys and mirrors the enums for the label-coverage test).

The 37 entries received the approved taxonomy; the three previously uncategorized
entries gained both levels (dsh-gzip → utility/net, dsh-approve-for-me →
security/policy, dsh-memories → knowledge/memory).

## Approach notes

- Ids are the stable contract; label text lives on the display side (site Chinese
  map, GUI locale dictionaries) so wording can change without touching the data.
- `scripts/market-layout.test.mjs` now asserts every non-other plugin in the
  committed manifest carries a subcategory and that `other` carries none, so the
  generated manifest cannot drift from the taxonomy.
- The GUI card fetches its manifest from the deployed dsh-market.com, so the
  subcategory pill row populates only after the site is redeployed with the new
  manifest (a dev push deploys the Workshop automatically).

## Alternatives considered

- Hierarchical single field (category `ui.chat`): rejected because it breaks the
  existing one-level consumers (site and card compare `item.category` against the
  selected pill) and requires migrating all entries; the additive field keeps the
  one-level contract intact.
- Free-form tags as the second level: rejected because filtering needs a closed,
  stable id set; free tags drift and produce pill churn with no validation.
- Per-entry subcategory without an enum: rejected; the pill row needs a fixed
  ordering and a bounded vocabulary, both guaranteed by the community-index enum.
- One flat subcategory row spanning all categories: rejected; grouping the second
  level under the selected category keeps the hierarchy readable with 23 subcategories.

## Consequences

- Users can narrow the Workshop plugin catalog by category and then by
  subcategory on both the site and the GUI card; the GUI card also stops showing
  raw category ids in badges.
- Older manifests without `subcategory` still work: categorized items appear
  under 全部 / All and the subcategory row shows only populated pills.
- New or updated community entries must declare `category` + `subcategory`
  to surface in the second-level filter; the index validator enforces the enum at
  merge time.

## Testing

- `node scripts/community-index --check`: 37 entries OK; new validator tests
  cover subcategory-without-category and out-of-enum rejection.
- `node scripts/market-build --check`: committed dist up to date (1138 files);
  `pnpm test:scripts` 205/205.
- dsh-market package: typecheck, 66 vitest tests (new filter unit tests, label
  coverage tests, and a MarketCard component test driving both filter rows), build.
- Live GUI (127.0.0.1:3080, workspace-linked profile): Settings → Workshop →
  Plugins shows category pills and labeled badges; console clean. Subcategory pills
  stayed at 全部/All 0 because the deployed manifest has no subcategory yet
  (pending site redeploy); the fully populated two-level filter was verified
  against the local rebuilt site (screenshots in gui-test-screenshots).
