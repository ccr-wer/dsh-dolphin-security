# Agent Note: 市场边缘 API 的写入限界与 manifest 白名单

Status: implemented

## Problem

三个匿名 POST 端点（`/api/like`、`/api/install`、`/api/telemetry/event`）读取 JSON 正文没有任何大小上限，且点赞/安装处理直接以客户端自报的 `(kind, asset_id)` 作为 D1 行键——只做了格式校验、从未做成员校验。脚本化请求用随机 64 字符 id 即可在 `likes`、`install_counts`、`telemetry_events` 中线性建行，推高 D1 存储与写入成本并污染对外公开的统计。只读审计确认宿主侧所有路由族都有正文限界（readBoundedJson、readBodyLimited、MAX_UPLOAD_BYTES），唯独家门口的边缘 Worker 没有。

## Decision

两道最小化、纯增量的闸门：

- `market/worker/src/body.js`（`readJsonCapped`）：Content-Length 快速拒绝加读取后长度复核，返回 `payload-too-large`（413）或 `invalid-json`（400）。上限：点赞/安装 4 KiB，遥测 16 KiB（最多 64 个小条目）。
- `market/worker/src/asset-allowlist.js`（`isKnownAsset`）：点赞/安装的资产 id 必须出现在已发布的 manifest 中（经 worker 自身 ASSETS 绑定读取 `/manifest/{skins,pets,plugins}.json`，与 `handleNpmDownloads` 的包名白名单同一模式）；未知 id 在任何 D1 写入前返回 400 `unknown-asset`。成员集按 isolate 缓存五分钟，以绑定标识为键。manifest 不可读时放行写入（可用性规则：该绑定是 worker 自己的资产存储，攻击者无法诱导）。

遥测条目刻意不做白名单：心跳会上报用户本地安装、未必来自创意工坊的插件，成员校验会误伤合法遥测；其增长由 16 KiB 上限、MAX_ITEMS 与按日折叠约束。

## Alternatives considered

流式读取并按字节计数以限制 isolate 内存的方案被否决：isolate 本就会缓冲请求体，真实的滥用面是解析成本加 D1 建行，两者已由读取后上限与 Content-Length 快路径约束。manifest 不可读时失败关闭的方案被否决：资产服务抖动会让点赞/安装整体不可用，且攻击者无法诱导该状态。按设备指纹限流的方案本次否决：指纹是客户端自报，限流只增代码挡不住脚本轮换；成员校验加 Turnstile 已把损害限制在每设备每已发布资产一票。

## Consequences

真实客户端不受影响：合法正文远低于上限，卡片请求的资产必然已发布，且任何非 ok 状态都会回滚乐观更新。已从 manifest 下架的资产拒绝新写入，但其历史计数仍正常展示。新发布资产在每个 isolate 上最长可能有五分钟缓存窗口内被拒。挑战 iframe 的跨域 token 农场路径（`/api/turnstile/challenge` 被第三方页面嵌框）仍然开放，作为独立发现另行跟踪。

## Testing

`node --test scripts/market-worker.test.mjs`（35 项全过）：新增用例覆盖 Content-Length 快路径、无 Content-Length 的流式路径、未知资产拒绝且 DB 桩未被触碰、manifest 在列资产放行且白名单缓存复用、manifest 故障时的可用性规则。
