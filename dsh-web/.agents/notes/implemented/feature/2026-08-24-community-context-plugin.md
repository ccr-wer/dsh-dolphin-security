# Agent Note: Register dsh-context in the community plugin catalog

Status: implemented

## Problem

The community plugin catalog had no entry for dsh-context, so DSH Web users could not discover its context inspection and visualization tools through the Workshop plugin manifest.

## Decision

Register `dsh-context` as the fourth entry in `packages/dsh-community-plugins/community.json`. The entry uses the repository `https://github.com/bowenliang123/dsh-context`, the published npm package `dsh-context`, the display names `上下文可视化` / `Context Visualizer`, and the `tools` category. The ordered entry is propagated into `market/dist/manifest/plugins.json` with rank 4.

## Constraints

- The repository remains an index-only data source; no third-party dsh-context code is vendored into dsh-web.
- The entry keeps paired Chinese and English descriptions and uses only the community-index contract fields.
- The existing order of every other plugin is preserved; entries after dsh-context receive their generated rank increment.

## Alternatives considered

- Appending dsh-context to the end: rejected because the requested default position is fourth.
- Categorizing it as `ui`: rejected because the plugin's primary purpose is context analysis and inspection, while the UI is its presentation surface; `tools` matches the catalog's analysis-plugin precedent.
- Omitting `npm`: rejected because the package is published as `dsh-context` and the npm install path is available.

## Consequences

- The Workshop and dsh-market.com plugin manifest expose dsh-context in the requested position after the market manifest is regenerated.
- The catalog still provides metadata and install links only; users remain responsible for evaluating the third-party plugin's code and security.
- Future ordering changes must be made in `community.json` and followed by the market manifest generation and consistency checks.

## Testing

- `node scripts/community-index --check` passes with 37 entries.
- `node scripts/market-build` regenerates the committed Workshop manifests with 37 plugins and dsh-context rank 4.
