# Agent Note：创意工坊插件二级分类

Status: implemented

## Problem

创意工坊插件目录此前只有一级分类（`category`：ui / tools / knowledge / integration / security / utility / agent）。dsh-market.com 站点的插件列表可以按一级分类 pills 筛选，但 GUI 创意工坊卡片只把分类显示为卡片徽章，没有任何筛选；37 条插件无法再按第二个维度收窄，而且卡片上的原始 id 徽章（如 "integration"）读起来像机器标识而非标签文字。

## Decision

给 `packages/dsh-community-plugins/community.json` 的每条目增加可选的二级字段 `subcategory`，由 `scripts/community-index` 按「一级 → 二级」枚举表（`SUBCATEGORIES`：ui → terminal/chat/render/panel，agent → preset，tools → context/browser/api/model/dev，knowledge → memory/reading/qa，integration → remote/bridge/sync/external-ai，security → access/policy，utility → cleanup/stats/notify/net）校验。`subcategory` 仅在 `category` 已填时被接受；「其他」桶（缺 `category`）不带二级。`scripts/market-build` 把 `subcategory` 传入 `market/dist/manifest/plugins.json`。

两处创意工坊表面都渲染两级筛选：

- dsh-market.com（market/src/app.js + index.html）：现有的一级分类 pills 行下方新增一行更小、虚线描边的二级 pills（带计数），只在选中某个一级分类后出现；二级按枚举的规范顺序排列；卡片与详情弹层在分类标签后追加二级标签。
- GUI 创意工坊卡片（packages/dsh-market）：插件 tab 增加分类与二级分类两行 pills（带计数，纯筛选逻辑抽取到 `src/client/filter.ts`），卡片徽章从原始 id 换成本地化标签（`category.*` / `subcategory.*` 中英键；`categories.ts` 建立 id → 键映射并镜像枚举供标签覆盖测试使用）。

37 条条目按确认后的分类表落地；此前未分类的 3 条补上了两级（dsh-gzip → utility/net，dsh-approve-for-me → security/policy，dsh-memories → knowledge/memory）。

## Approach notes

- id 是稳定契约，标签文字放在展示侧（站点中文词表、GUI 语言包），改文案不动数据。
- `scripts/market-layout.test.mjs` 现在断言提交清单中每个非 other 插件都带 `subcategory`，`other` 一律不带，防止生成清单脱离分类表。
- GUI 卡片从线上的 dsh-market.com 拉取清单，因此二级 pills 行要在站点用新清单重新部署后才会填充（dev 推送会自动部署创意工坊）。

## Alternatives considered

- 单字段层级化（category 写成 `ui.chat`）：不取，它会破坏现有的一级消费方（站点与卡片用 `item.category` 与所选 pill 比较）并需要迁移全部条目；增量字段保持一级契约不变。
- 用自由 tags 当二级：不取，筛选需要封闭、稳定的 id 集；自由标签会漂移且无校验，造成 pills 抖动。
- 条目自填二级不做枚举：不取；pills 行需要固定顺序与有限词表，二者都由 community-index 枚举保证。
- 跨全部一级的扁平二级行：不取；23 个二级类目挂在所选一级之下才保持层级可读。

## Consequences

- 用户在站点与 GUI 卡片都能先按一级分类、再按二级分类收窄创意工坊插件清单；GUI 卡片也不再在徽章里显示原始分类 id。
- 旧清单（无 `subcategory`）仍然兼容：已分类条目出现在「全部 / All」，二级行只显示有数据的 pills。
- 新登记或更新条目必须声明 `category` + `subcategory` 才能在二级筛选中出现；索引校验器在合并时强制执行枚举。

## Testing

- `node scripts/community-index --check`：37 条 OK；新增校验器测试覆盖「无 category 带 subcategory」与「超出枚举」的拒绝路径。
- `node scripts/market-build --check`：提交的 dist 与源一致（1138 文件）；`pnpm test:scripts` 205/205 通过。
- dsh-market 包：typecheck、66 个 vitest 测试（新增筛选纯函数测试、标签覆盖测试与驱动两行筛选的 MarketCard 组件测试）、构建通过。
- 线上 GUI（127.0.0.1:3080，workspace 链接 profile）：设置 → 创意工坊 → 插件显示分类 pills 与标签徽章，控制台无错误；二级 pills 暂为「全部 0」因为线上清单尚无 subcategory（待站点重新部署）；完整两级筛选已用本地重建站点验证（截图见 gui-test-screenshots）。
