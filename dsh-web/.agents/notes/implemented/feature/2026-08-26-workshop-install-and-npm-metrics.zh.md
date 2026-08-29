# Agent Note：创意工坊安装量与插件 NPM 下载指标

Status: implemented

## 问题

创意工坊卡片与 dsh-market.com 此前只按设备点赞排序；npm 下载数仅存在家族徽章层面，没有任何逐条目信号表明创意工坊本身是否被使用。站点拥有者需要两个彼此严格分离的指标：工坊特有的安装量，以及带 npm 包的插件的 registry 下载量。

## 决策

两个独立指标合并进共享的 `/api/stats` 读接口与卡片/站点渲染，但绝不求和：

- **工坊安装量**：一次性 `install_events` 行加 `install_counts` 聚合（迁移 `0004_install_events.sql`）。`POST /api/install` 每次成功安装记录一件事件，Turnstile 门禁，事件 id 由 (kind, asset_id, 设备指纹哈希, install_id) 确定性派生——同一安装重试折叠，新安装再次计数。插入、重算、读取三条语句在同一个 D1 批次执行。浏览器半区只在 host 网关或 pluginManager 安装成功解析后上报，并把返回计数乐观更新到卡片。
- **插件 NPM 下载量**：`GET /api/npm-downloads` 读取已发布插件清单派生包名白名单（任何查询参数都不驱动上游查找），逐包取 npm `point/last-month` API，按 isolate 缓存一小时并带 30 分钟边缘缓存。未发布或不可用的包不进入响应，绝不显示 0。
- Turnstile 挑战 iframe 现在接受 postMessage 请求中的 `action`（`market-like` 或 `market-install`），使同一个隐藏 widget 服务两个写端点。

卡片与站点分别以 `/api/stats` 的 `installs` 与 `/api/npm-downloads` 展示两类标签；无 npm 名的条目永不显示 npm 指标。

## 备选方案

- 复用心跳 UV 作为安装量：被否决，因为心跳统计「已安装且启用」的浏览器（留存类信号），无法与其它来源区分工坊安装。
- 统计安装按钮点击：被否决；点击不是安装，失败安装不应计数。
- 把下载量烘进静态清单：被否决；清单是确定性构建产物，`market-build --check` 逐字节比较，网络派生字段会过时并破坏门禁。
- 把 npm 计数并入 `/api/stats`：被否决；`/api/stats` 是 no-store 缓存且刷新节奏不同，而 npm 批量需要小时级缓存，同时保持两个指标物理分离。

## 后果

- 安装计数从零开始；迁移前已存在的安装不回填。累计计数与 npm 批量在下次用户操作与部署后开始有意义。
- 写端点是匿名且像点赞一样 Turnstile 门禁，伪造写入受限但非不可能；接受为趋势阅读的噪声。
- 在创意工坊卡片之外安装插件（终端直接 `dsh plugin`）不上报，不推动工坊安装量。
- `/api/stats` 现在携带 `installs` 对象；忽略未知字段的消费者继续工作，`readInstalls` 在迁移未应用时降级为空计数。

## 验证

`pnpm test:scripts`（market-worker.test.mjs 覆盖安装记录、参数拒绝、npm 批量缓存与清单不可用降级），`pnpm --filter @linxin666/dsh-client-ui-market test` 与 `typecheck`，`pnpm market:check` 与 `pnpm docs:check`。

相关：[匿名安装遥测](../feature/2026-08-24-anonymous-install-telemetry.md)（按浏览器心跳仍是留存信号，未取代）与 [npm 徽章端点](../feature/2026-08-24-npm-badge-endpoint.md)（家族合计，未取代）。
