# Agent Note: 创意工坊皮肤与插件的 GitHub 源码链接

Status: implemented

## Problem

创意工坊（dsh-market.com 站点与 GUI 内的创意工坊卡片）无法到达皮肤或插件的 GitHub 源码：插件详情弹层有仓库行，但卡片名称不是链接；皮肤清单项根本没有仓库字段，点击皮肤或插件名称无法打开对应仓库（issue 1120）。

## Decision

把清单字段 `repo` 作为皮肤与插件在两端统一的源码仓库链接。每个皮肤要么使用显式 `sourceUrl`，要么链接到本仓库的皮肤目录：

- `scripts/market-build` 把显式 v2 `skin.json` 的 `sourceUrl` 原样镜像进 `market/dist/manifest/skins.json` 的 `repo`；没有声明 `sourceUrl` 的皮肤链接到本仓库对应的皮肤目录。插件 `repo` 仍由 `community.json` 原样流入，且仅在声明时输出。
- 市场站点（`market/src/app.js`）：带 `repo` 的皮肤与插件卡片名称渲染为外链锚点，悬停样式在 `market/src/index.html`；皮肤详情弹层新增插件弹层已有的「源码仓库」行。无仓库条的条目保持纯文本，宠物卡片保持非链接（宠物没有 repo 字段）。
- GUI 卡片（`@linxin666/dsh-client-ui-market`）：带 `repo` 的皮肤与插件卡片名称改为外链锚点；原卡片底部「源码仓库」链接同时覆盖皮肤。无仓库条的条目保持纯文本。
- 域名可点击：共享 `PluginSettingsCard` 外壳新增可选 `descriptionNode`，替代纯文本 `t(descriptionKey)` 头部描述（纯文本保留为 tooltip）；创意工坊卡片传入把 `dsh-market.com` 包成 `https://dsh-market.com` 链接的节点（issue 1120 追加要求）。八个消费方副本由 `scripts/sync-shared.mjs` 重新生成。

## Constraints

- 宠物不在范围内（issue 只涉及皮肤与插件）。
- 不新增 schema 或清单文件：v2 `skin.json` schema 已声明 `sourceUrl`，market-build 只是把它镜像进市场清单。
- 未声明 `sourceUrl` 的皮肤链接到其已提交资产所属的仓库目录；显式的第三方源码 URL 仍然优先。
- 所有链接新标签页打开并带 `rel="noopener"`/`noreferrer`；安装器信任模型不变（仓库链接仅展示，绝不作为安装来源）。
- GUI 清单结构除新增 `repo` 字段外不变；`MarketRecord.repo` 原本已存在。

## Alternatives considered

- 让仓库内皮肤没有链接：不取，因为 issue 要求用户发现每个皮肤对应的 GitHub 源码；未声明独立 `sourceUrl` 时，目录就是资产的所属源码。
- 在全部 19 个 `skin.json` 手工填 `sourceUrl`：更显式，但把仓库来源手抄进每个 manifest；不取，因为生成器已经知道所属目录，并且可以保留已声明的独立来源 URL。
- 只链接插件详情弹层：不取——issue 明确要求两端在名称层级跳转。

## Acceptance criteria

- `skins.json` 每个皮肤条目都有 https `repo`：声明时与 `skin.json` 的 `sourceUrl` 完全一致，否则指向对应皮肤目录（在 `scripts/market-layout.test.mjs` 对照皮肤源码强制）。插件 `repo`（存在时）保持 https。
- `packages/dsh-market/tests/market-card.spec.tsx` 断言皮肤/插件名称链接、皮肤底部仓库链接和可点击的 `dsh-market.com` 头部描述；`scripts/market-layout.test.mjs` 断言未声明独立源码 URL 的皮肤使用目录回退链接。
- `node scripts/market-build --check`、`node scripts/sync-shared.mjs --check`、`pnpm test:scripts`、`pnpm --filter @linxin666/dsh-client-ui-market` 的 typecheck/test/build 全部通过。

## Source record

实现文件：`scripts/market-build`、`market/src/app.js`、`market/src/index.html`、`shared/client/settings/PluginSettingsCard.tsx`（连同重新生成的消费方副本）、`packages/dsh-market/src/client/MarketCard.tsx`、`packages/dsh-market/src/client/locales.ts` 以及重新生成的 `market/dist` 与 `packages/dsh-market/lib` 产物；测试于 `packages/dsh-market/tests/market-card.spec.tsx` 与 `scripts/market-layout.test.mjs`。
