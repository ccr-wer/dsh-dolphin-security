# Agent Note: worker 直出的 HTML 与 Markdown 响应加 nosniff

Status: implemented

## Problem

worker 直接渲染的两类响应——首页的 Markdown 表示（正文插值了 manifest 派生字段）与 `/api-docs.html`——只设置了 content-type、cache-control 与 ACAO，没有 `x-content-type-options` 或 referrer policy。这纯粹是纵深防御：当前没有任何路径嗅探这些正文，但一旦未来 content-type 处理出现回归，就没有第二道屏障。

## Decision

两个响应现在都发送 `x-content-type-options: nosniff`。其余头不变；响应值虽来自 manifest，但构造时已转义，因此这是每处一行的加固。测试对两个响应都断言该头。

## Alternatives considered

为所有 worker 响应加统一头中间件的方案被否决：JSON API 响应已声明 JSON content-type，加 nosniff 不改变任何行为，共享封装只有仪式感没有覆盖收益。加 `referrer-policy` 被否决：与 MIME 混淆缺口无关，且这些页面不携带任何凭据。

## Consequences

对合规客户端无行为变化；未来若某响应被错误标注，本会 MIME 嗅探的浏览器将拒绝执行。该头由现有的首页 Markdown 与 api-docs 测试钉死。

## Testing

`node --test scripts/market-worker.test.mjs`（36 项全过），含两个响应上的 nosniff 断言。
