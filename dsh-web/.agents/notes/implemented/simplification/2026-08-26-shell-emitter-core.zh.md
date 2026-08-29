# Agent Note: 市场试玩 shell 的共享 shim 事件发射器核心

Status: implemented

## Problem

WebDsh 试玩 shell 的五个 shim 各自携带一份手工克隆的极简事件发射器：`src/net/virtual-websocket.ts`（Emitter）、`src/node/worker_threads.ts`（Emitter）、`src/node/ws.ts`（WebSocketServer 内联注册表）、`src/node/streams.ts`（StreamEmitter）与 `src/node/fs.ts`（FSWatcher）。全部实现 on/once/off/removeListener 式注册与捕获并记录日志的监听器分发；fs 那份已经漂移（缺 try/catch），正好演示了审计指出的重复代码隐患。

## Decision

`market/shell/src/node/emitter-core.ts` 现在承载唯一的 `ShimEmitter`（监听器集合的 Map；on/addListener/once/off/removeListener/removeAllListeners/listenerCount；emit 逐监听器 try/catch 并按子类标签记录日志；fire 为 void 别名）。五个 shim 均以既有日志标签继承它。刻意不复用 vendored 的 node:events 实现（events-impl.ts）：它遵循 Node 语义会传播监听器异常，而这五处调用点全部是 fire-and-forget 的泵，消费方抛错不应打断 shim。

## Alternatives considered

复用 events-impl.ts 的 EventEmitter 因错误传播契约被否决（如上）。给 events-impl 加 try/catch 被否决：会静默改变所有 node:events 消费方的 Node 对齐语义。不做抽取（保留五份副本）被否决：fs 的漂移已证明副本会静默分叉。

## Consequences

一处有意为之的行为差异：fs watcher 监听器异常现在与其余四个 shim 一样被捕获并记录日志，而不再从 volume.watch 回调中传播（此前会以未处理错误逃逸）。各 shim 的日志标签不变，控制台诊断仍可归因。StreamEmitter 经继承保留其导出名与完整 API；WebSocketServer 的 emit 从 private 放宽为 public（对 shim 表面无害）。试玩 bundle 随之变化，已按市场产物规则重新生成并提交 market/dist。

## Testing

对 shell 的 `npx tsc --noEmit` 与 `npm run build`（完整 assemble + vite）通过；`node scripts/market-build` 重新生成了 market/dist，`pnpm market:check` 校验已提交产物。除此之外行为一致；这些 shim 没有专门的单元套件（五份克隆均为无断言的工具代码），由 shell 的 e2e 线束形态覆盖。
