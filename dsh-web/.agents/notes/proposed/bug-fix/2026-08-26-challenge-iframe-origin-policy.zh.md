# Agent Note: Turnstile challenge iframe 跨源嵌入（待定决策）

Status: proposed — 优化运行期间两次向用户请求决策均无答复；选项记录于此，不改代码

## Problem

worker 的 `/api/turnstile/challenge` 页面（market/worker/src/index.js 的 `challengePage`）可被任意来源 iframe 嵌入：早期的 Referer 白名单检查已移除（提交 3385d5254），因为合法嵌入方天然是任意的——每个用户的 DSH Web GUI 来源都不同。安全审计指出第三方站点可以嵌入该 challenge 批量收割已通过的 Turnstile token，再投向 `POST /api/like`。滥用上限很低：token 一次性且绑定单一 action，like 本就过 Turnstile 闸门，且所有写入都受限流与 allowlist 约束，但这条 token 农场路径是设计使然地存在。

## Proposal (awaiting user choice)

选项 A（审计上下文推荐）：记录为已接受风险——challenge 有意来源无关，因为嵌入方天然任意；滥用由 Turnstile 本身加逐次写入闸门兜底。选项 B：为 /api/like 增加按 IP 的写入限流（需要 worker 侧状态，如 D1 计数或 Workers rate-limiting 绑定）。选项 C：把 invisible challenge 换成交互式组件，提高收割成本但改变用户流程。审计的 origin 白名单方案被直接否决：它会破坏产品合法的任意来源嵌入方。

## Alternatives considered

在用户未选定前实施任一选项的做法被否决：A 属于安全姿态决策记录，B/C 改变公共端点的生产行为——三者都应由用户拍板。

## Consequences

本 note 不改变任何代码或文档行为。用户选定的选项应作为独立改动落地并附各自的 implemented note。

## Evidence

审计发现附具体攻击路径（iframe + token 重放至 /api/like）；challengePage 与 verifyTurnstile 见 market/worker/src/index.js；被移除的 Referer 闸门的理由见提交 3385d5254。
