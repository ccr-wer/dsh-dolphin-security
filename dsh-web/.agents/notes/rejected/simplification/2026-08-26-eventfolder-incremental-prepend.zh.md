# Agent Note: EventFolder 增量 prepend——实测低于证据门槛

Status: rejected — 实测成本低于任何用户可感知阈值；不交付任何改动

## Problem

一份只读性能审计提议把 `EventFolder.prepend` 的整树 `createState([...older, ...messages])` 重建替换为增量插入，理由是深度「加载更早消息」回滚会话累计 O(N²/P) 的重算（`packages/dsh-remote-web-ui/src/mobile/messages.ts`）。

## Proposal (declined)

把旧页消息行增量插入现有索引映射，而不是每次 prepend 重建 FoldState。

## Alternatives considered

实测之后否决增量插入的实现。保持现状没有任何可测成本；平方级指数受用户点击频率约束，且单次点击的绝对耗时极小。

## Evidence

基于真实 EventFolder 的基准（node，/tmp/bench-prepend.mjs，5 次运行）：向 8000 条消息的 folder prepend 一页 30 条的中位成本为 0.62ms（最差 1.40ms）；连续 100 次 prepend——即一次极限深度回滚会话——总计 0.5ms。该重建只在用户手势时发生一次，从不在流式事件路径上。不存在可优化的用户侧成本；为 FoldState 增加增量插入不变量只会带来无收益的复杂度与回归风险。除非出现真机 trace 反证，否则不再重启此项。
