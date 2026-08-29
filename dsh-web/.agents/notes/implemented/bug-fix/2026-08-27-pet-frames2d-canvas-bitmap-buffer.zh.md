# Agent Note: pet frames2d canvas bitmap buffer replaces per-frame img.src swaps

Status: implemented

Supersession check：没有活跃 Note 拥有 frames2d 的*播放机制*；[frames2d gameplay](../../feature/2026-08-25-frames2d-gameplay-miku.md) 拥有清单契约与玩法层，本次未触碰。证据来源：[dsh-perf attribution scoreboard](../../feature/2026-08-27-dsh-perf-plugin-attribution-scoreboard.md) 的测量会话。

## Problem

Phase-1 基线普查把每 8 秒约 39 次 `<img>.src` 换图（空闲稳态的 `miku-pet-stopN.webp` 轮换）归因到 frames2d 渲染器：每个 tick 换一次图片元素的 src——即使字节已在浏览器缓存里，每次都会驱动一次图像解码加一次绘制失效。这是 [orca 死写入面清理](../simplification/2026-08-27-orca-status-character-dead-write-surfaces.md) 之后最后一个插件侧反复写入者；它不碰样式重算，但持续给原生的解码/绘制链供料，也让宠物成为我们手里最大的单一 DOM 写入源。

## Decision

`frames2dRenderer.mount` 现在做一次性能力探测并二选一：

- **画布位图缓冲**（存在 `createImageBitmap`、`fetch` 与真实 2D context 时）：预热通道把所有已配置帧各解码一次存入记忆化的 `ImageBitmap`；播放在一块 `<canvas>` 上进行，带代际 token 守卫（过期的异步绘制直接丢弃），仅在解码尺寸不同才重设后备存储否则显式 clearRect。稳态播放做到**零 DOM 变更、零重复解码**。
- **经典 `<img>` 回退**：任一探测失败时保持历史行为逐字节不变（守卫式 `src` 换图）——jsdom、测试与奇异嵌入式运行时照旧工作。

播放调度、相位映射、玩法 override/释放、停滞看门狗、reduced-motion 保持和幂等 dispose 全部不变；dispose 额外等齐在途解码并对每个位图调用 `close()`。manifest v2 的 `frames2d` 块没有新增字段。

## Alternatives considered

- **离线合并雪碧图**（构建期把轨道帧合成图集）：长期有吸引力（与 sprite2d 的合成路线一致）但本轮否决——要改动贡献者的资产包与已发布的 miku 包，正是维护者不愿为视觉路径承担的同类前后风险。
- **React state 驱动逐帧**：否决——渲染器当初就刻意避开逐帧 React 状态；迁移回去会把协调成本重新引入每个 tick。
- **纯 CSS `steps()` 动画**：否决——逐帧时长来自清单的不规则列表，且背景步进每帧重绘（性能契约 R3 对皮肤 hook 的理由同样适用）。
- **继续换缓存图**：被测量否决——缓存命中仍要付调度解码与失效；常驻位图的 drawImage 不需要。

## Consequences

- 可见期间归因到宠物的空闲页 DOM 写入降为零；解码工作从 O(ticks) 变为一次性的 O(总帧数)。
- 位图内存自 mount 到 dispose 常驻，上界由下发的轨道列表决定（帧都是小块 webp）。
- 两种模式按构造像素等价；canvas 假件证明绘制/dispose 契约。当日服务重启后已拿到现场确认（归档快照 [20260827-phase1-performance-round-snapshot](../../../../docs/archive/20260827-phase1-performance-round-snapshot.md)）：运行中 GUI 上归因到宠物的 `<img>.src` 变更在 15 秒窗口内从 74 次降到 0，总变更 -24%，时间线任务时长 -10%、UpdateLayoutTree -21%、Paint -28%、脚本执行 -44%（对 Phase-1 基线）。

## Testing

- `src/client/renderers/frames2d.test.ts`：新增三条覆盖画布分支——canvas 取代 img 且随时间推进经 drawImage 绘制（预热对测试配置恰好解码 6 个位图）、后备存储尺寸来自解码尺寸且 dispose 后全部释放、相位切换持续绘制且子元素数不变。原有八条在 `<img>` 回退模式下原样通过，证明模式选择不影响旧环境。包级门禁：vitest 448/448、typecheck 干净、client bundle 已重建。