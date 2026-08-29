# @linxin666/dsh-client-ui-community-plugins

English | [中文](README.zh.md)

The community plugin index data source of the dsh web ecosystem: `community.json` is the single source of the Workshop store plugin catalog and the dsh-market.com plugin manifest (`manifest/plugins.json`). Entries only carry links and metadata pointing at each third-party plugin author's own repository — this repository never vendors their code.

## What it does

- Index data: `community.json` is merged by maintainer review (see the "社区插件索引登记" section of [docs/plugins.md](../../docs/plugins.md)); every entry requires `id` / `name` / `nameEn` / `author` / `repo` plus optional `description` / `descriptionEn` / `npm` / `category` / `subcategory` (`subcategory` is the second-level classification under `category`; see the enums in `scripts/community-index`, and it is accepted only when `category` is set).
- Consumers: `scripts/market-build` derives the Workshop store and dsh-market.com plugin manifests from this file.
- Validation: `node scripts/community-index` checks the index contract (the `pnpm community:check` CI gate runs the same check).
- No settings surface: this package no longer ships any UI (the community plugin card was replaced by the Workshop store's plugin catalog); the inert cordis row only keeps existing profiles and the aggregate resolving it — it contributes no UI after install.

## Install

This package does not need a direct install; it ships with the repository as the index data source.

Profiles that still mount the old card (for example through the aggregate) can uninstall `@linxin666/dsh-client-ui-community-plugins` from the plugin manager tab in the official Plugins section (effective on next start).

## Known limitations

- The index only carries links; it does not validate third-party code quality or security, and each entry belongs to its original author.
- Making a new entry reach the Workshop site and the store requires running `node scripts/market-build` and committing the generated `market/dist` (the `market:check` gate).
