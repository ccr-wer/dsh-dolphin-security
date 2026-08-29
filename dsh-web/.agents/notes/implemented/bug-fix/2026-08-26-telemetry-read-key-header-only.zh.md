# Agent Note: 遥测读取密钥改为仅请求头携带并做摘要比对

Status: implemented

## Problem

`/api/telemetry/summary` 曾接受以 URL 查询参数 `?key=` 作为 `x-telemetry-key` 请求头之外的第二种密钥携带方式，且用裸 `===` 比对。URL 中的凭据会留存在 Cloudflare 边缘日志与分析、浏览器历史、外链 referrer 以及被分享或收藏的链接里——在轮换之前构成持久的密钥泄露。受保护的数据仅为聚合计数，滥用爆炸半径有限，但凭据本身是设计性地泄露。

## Decision

`summaryAuthorized` 现在只接受 `x-telemetry-key` 请求头，并对呈现的密钥与配置的密钥分别计算 SHA-256 摘要后比较，不再做裸字符串比较。`?key=` 参数即使正确也一律 403。OpenAPI 增加该请求头参数并明确注明不接受查询参数；`api-doc.js` 与 `docs/telemetry.md` 删除 `?key=` 用法说明并写明原因。内部遥测查看器（`market/telemetry-view`）本就通过请求头鉴权，无需改动。测试现在钉死「查询参数中的正确密钥也被拒绝」。

## Alternatives considered

为浏览器便利保留 `?key=` 的方案被否决：该便利正是泄露通道，而已文档化的消费方（curl、telemetry-view worker）都能发送请求头。曾考虑用 `crypto.subtle.timingSafeEqual` 做定时安全比较；Workers 仅在较新 API 上暴露它，而复用现有 `sha256` 辅助函数对两侧做哈希即可得到定长比较、无需新依赖——为兼容与简洁否决了新 API。密钥轮换机制超出本次堵口范围，否决。

## Consequences

此前在摘要 URL 后追加 `?key=` 的书签或仪表盘会以 403 失效，需改为发送请求头；其余行为不变。曾分享过带密钥 URL 的人应轮换 `TELEMETRY_READ_KEY`——旧 URL 无论如何都已留在日志中。未配置密钥的部署不受影响（摘要接口按设计保持开放）。

## Testing

`node --test scripts/market-worker.test.mjs`（35 项全过）：读取密钥套件现在断言「错误请求头 403、正确查询参数 403、正确请求头 200」。
