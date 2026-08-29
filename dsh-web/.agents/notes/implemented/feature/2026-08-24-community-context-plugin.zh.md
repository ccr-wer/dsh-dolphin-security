# Agent Note：在社区插件目录登记 dsh-context

Status: implemented

## Problem

社区插件目录此前没有 dsh-context 条目，因此 DSH Web 用户无法通过创意工坊插件清单发现它的上下文检查与可视化工具。

## Decision

在 `packages/dsh-community-plugins/community.json` 中将 `dsh-context` 登记为第 4 条。条目使用仓库 `https://github.com/bowenliang123/dsh-context`、已发布的 npm 包 `dsh-context`、显示名 `上下文可视化` / `Context Visualizer` 与 `tools` 分类。排序后的条目传播到 `market/dist/manifest/plugins.json`，生成 rank 4。

## Constraints

- 本仓库仍然只是索引数据源；不会把第三方 dsh-context 代码内嵌进 dsh-web。
- 条目保留成对的中英文描述，只使用社区索引契约允许的字段。
- 其他插件的既有顺序保持不变；dsh-context 后面的条目由生成器顺延 rank。

## Alternatives considered

- 将 dsh-context 追加到末尾：不取，因为用户要求默认排在第 4 个。
- 将其归类为 `ui`：不取，因为插件的主要用途是上下文分析与检查，UI 是呈现界面；`tools` 与目录中同类分析插件的惯例一致。
- 省略 `npm`：不取，因为 `dsh-context` 已发布且可使用 npm 安装路径。

## Consequences

- 重新生成市场清单后，创意工坊与 dsh-market.com 插件清单会按要求在第 4 位展示 dsh-context。
- 目录仍只提供元数据与安装链接；第三方插件的代码与安全性仍由用户自行评估。
- 后续排序调整必须修改 `community.json`，并重新生成市场清单和运行一致性检查。

## Testing

- `node scripts/community-index --check` 通过，共 37 条。
- `node scripts/market-build` 已重新生成提交中的创意工坊清单，共 37 个插件，dsh-context 的 rank 为 4。
