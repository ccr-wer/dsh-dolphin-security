# Agent Note: 移动端 ChatView 的批量直播事件折叠

Status: implemented

## Problem

移动端 ChatView 此前对每个到达的 mux 事件单独折叠（在 `setMessages` 更新器里逐个 `folder.fold([event])`）。只要折叠应用了事件就会以全新的 O(消息数) 数组拷贝重建快照，因此直播流成本为 O(事件数 × 消息数)：在 8000 条已渲染消息、单轮 2000 个 chunk 事件的基准下，基于真实 `EventFolder` 测得每轮约 24ms 纯折叠耗时（桌面 CPU，5 次取中位数），并随历史深度平方级增长——此外还有每事件一次的 React 状态更新。只读审计也从代码层面指出了同一路径。

## Decision

ChatView 现在缓冲直播事件并按突发批量折叠：chunk 事件（`assistant/chunk` / `message/chunk`）等待 50ms 冲刷定时器（导出的 `FOLD_FLUSH_MS`），其余所有事件类型（最终 assistant 消息、turn/end、用户回显、update/delete）同步冲刷缓冲区，使稳定态 UI——包括 ChatView.stream.test.tsx 钉死的逐字节一致的终态渲染——永不等待该节奏。mux effect 的清理会取消待执行的冲刷并丢弃缓冲区，因为缓冲事件属于正在拆除的会话。`EventFolder` 本身不变；其文档注释改为陈述真实的成本契约（每批应用一次快照拷贝，由消费方批量化摊销），不再声称每事件 O(1)。

## Alternatives considered

在 FoldState 内加 id→index 映射（消除 replaceMessage/removeMessage 中 O(消息数) 的身份扫描）的方案已实现、实测并被否决：在 M=8000/E=2000 下，Map 维护使逐事件路径（约 26.8ms 对基线约 24.0ms）与批量路径（约 8.9ms 对 6.9ms）都更慢——在真实规模下指针身份扫描比 Map 的 set/delete 搅动更便宜。为 applyTurnEnd 加 turn→消息反向索引的方案基于成本判断未实施即否决：turn/end 每轮只触发一次，O(消息数) 过滤只是微秒级。requestAnimationFrame 批量方案被否决：后台标签页 rAF 暂停，隐藏流式期间缓冲区会无界增长；定时器在任何环境都工作。

## Consequences

流式 chunk 到达 DOM 最多比此前晚 50ms（相对既有的 STREAM_RENDER_INTERVAL_MS markdown 节流不可感知）；所有非 chunk 事件照旧立即渲染。每轮折叠耗时下降约 3.5 倍（M=8000/E=2000 时中位数 24.0→6.9ms，桌面 Node；手机 CPU 会放大绝对收益），React 状态更新从每事件一次降为突发期每秒至多 20 次。基准数字在本机以 /tmp 脚本测得；未在真机上测量。

## Testing

`pnpm --filter @linxin666/dsh-remote-web-ui typecheck` 与 `test`（397 项全过）。ChatView.stream.test.tsx 现在导入 FOLD_FLUSH_MS 并为首个 chunk 的挂载推进冲刷节奏；终态渲染与收尾折叠测试因终止事件同步冲刷而原样通过。基准：/tmp/bench-fold.mjs，每场景 5 次取中位数。
