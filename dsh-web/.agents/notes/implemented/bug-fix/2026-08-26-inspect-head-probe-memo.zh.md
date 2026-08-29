# Agent Note: 卡死执行检查的 history 头部探测备忘

Status: implemented

## Problem

`HostExecutionRunner.inspect` 通过向后翻页会话历史（至多 100 页 × 100 条事件）来寻找该次执行的 `turn/end`。当不存在匹配的 `turn/end` 时（适配器不匹配、宿主状态异常），完整扫描落空并返回 `pending`，随后每 5 秒的轮询 tick 都会为同一次执行重新拉取并解析整段历史——持续的宿主 CPU 与带宽开销与会话大小成正比，且随卡死执行数量成倍放大。只读审计给出了具体的文件行号证据指出了该循环。

## Decision

`inspect` 在翻页前先做一次单消息探测（`maxMessages: 1`，取最新页），将其头部 seq 与按会话记录的「上次完整扫描落空时的头部 seq」备忘比对。头部未变即证明没有新事件追加，扫描结果不可能改变，于是跳过深扫。备忘只在扫描到达执行边界且未找到 `turn/end` 后写入，并在会话运行中、已完结或消失时清除。`SessionSummary.updatedAt` 被排除作为变更信号：按其契约它跟踪最近一次人类输入的 prompt，而非事件追加，用它做备忘可能永久错过迟到的 `turn/end` 落盘。

## Alternatives considered

按 `updatedAt` 做备忘因正确性原因被否决（如上）。「连续 pending 计数 + 硬放弃」方案被否决：卡死的执行在其 turn/end 迟到落盘时仍可能合法完结，静默将其完结会污染账本。每 tick 构建 sessionId 索引 Map 以替代逐执行 `items.find` 的方案被作为未实测的微优化否决——会话列表很小，且 find 每 tick 每个未完结执行只跑一次。把探测页与扫描第一页合并的方案为保持清晰被否决：探测只是一次极小的 RPC，且只在可能启动扫描时发生。

## Consequences

卡死执行现在每 5 秒 tick 只花一次单消息 history RPC，而不是至多 100 次翻页拉取；历史仍在写入的执行照常每 tick 扫描（备忘只在完整落空后形成），任何新事件都会抬高头部 seq 并恰好触发一次新的完整扫描。探测在成功路径上多一次 RPC（探测 + 扫描，原为仅扫描），已体现在更新后的调用次数断言中。完结时机与结果判定无任何行为变化。

## Testing

`pnpm --filter @linxin666/dsh-client-ui-task-board typecheck`、`test`（237 项全过）与 `build`。新增的 host-runner 用例钉死「探测后跳过」契约：头部不变的第二个 tick 只花一次探测调用，头部抬高会强制完整重扫，完结或消失的会话会清除备忘。
