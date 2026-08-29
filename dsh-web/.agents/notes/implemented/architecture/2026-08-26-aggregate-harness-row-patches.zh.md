# Agent Note: 聚合包原样透传对官方行的 patch 行

Status: implemented

## Problem

dsh-perf 的 bundle patch 包含两类内容：自身的插件行（`- insert:` 行，携带运行配置），以及顶层 bare 行——对官方 harness 行 `session-persistence-jsonl` 的整体 patch（写批延迟 200ms → 500ms，逐键重述基行全部配置键）。聚合生成器（`scripts/aggregate.mjs`）原先只认识「`- id:` 后紧跟 `name:`」的固定格式，并把所有块渲染成 `- insert:` + 命名空间化 id。把 dsh-perf 的 patch 喂给它，产出的是 `web-ui-session-persistence-jsonl` 插入行：官方行根本没被 patch（写批优化静默失效），同时与官方行挂载同名插件的第二个实例，存在双挂载风险。

## Decision

- `scripts/aggregate.mjs` 现在把子包的 `cordis.patch.yml` 解析为两类行块。`insert` 行（在 `- insert:` 块内）保持命名空间化，且现在保留 `config` 行。`patch` 行（顶层 `- id:`，无 insert 包裹）原样透传——原始 id、name 与 config 逐字保留——按 id 定位已挂载的官方行，与独立安装时行为完全一致。
- `packages/dsh-perf/cordis.patch.yml` 给官方行 patch 补上必需的 `name:` 行（生成器解析契约要求 id 后紧跟 name）。
- `packages/dsh-web-all/aggregate.yml` 在 `patchFrom` 与 `deps` 同时加入 `../dsh-perf`；重生成的聚合包含 `web-ui-dsh-perf`（带 config）与原样的 `session-persistence-jsonl` patch。dsh-perf 在 v0.3.5 首次以全仓统一版本发布。
- 重述键已与官方 `@deepseek-ai/dsh-session-persistence-jsonl` schema 默认值核验：`packChunks: true`、`compression: zstd`、`preparedSessionCacheSize: 5` 全部一致；仅 `writeBatchMaxDelayMs` 有意不同（500 vs 200）。

## Alternatives considered

- 生成器不改，直接从 dsh-perf 移除官方行 patch：被否决——写批频控是 dsh-perf 的核心特性（流式期间每次落盘 sync 约降 2.5x），进入聚合后静默丢失不可接受。
- 生成器维持原行为，把 bare 行也命名空间化：被否决——`web-ui-session-persistence-jsonl` 是挂载同名插件的新 id，与官方行构成双挂载，加载顺序未定义。
- 生成器解析改用通用 YAML 库：被否决——仓库无 js-yaml/yaml 依赖，且现有 `parseManifest` 已确立手写 YAML 子集扫描风格；延续该风格保持文件格式与错误路径一致。

## Consequences

- 聚合现在为 20 行 / 18 依赖；`aggregate:check`、聚合脚本测试（5/5）、`pnpm test:scripts`（211/211）以及 dsh-web-all、dsh-perf 包测试保持全绿。
- 从 v0.3.5 起安装 `@linxin666/dsh-web-all` 的用户默认启用 dsh-perf（行配置：meter 2000ms、窗口 120s），官方写批延迟为 500ms。
- 未来需要 patch 官方行的子包，在其 `cordis.patch.yml` 写一条顶层 bare `- id:` 行（带 name 与 config）即可，聚合器原样转发。子包的 patch 行必须重述目标行拥有的全部键——配置是整体替换，从不合并。
