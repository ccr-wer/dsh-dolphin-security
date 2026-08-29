# Agent Note: dsh-perf 渲染 shadow 重构

Status: implemented

## Problem（问题）

dsh-perf 的「渲染降载」层在真实 GUI 中从未生效过一次，且其预期形态本身就不对：

1. **P0 CSS 降载静默失效**：注入的规则为
   `[data-chat-flow-kind="assistant-step"],\n[data-chat-flow-kind="tool-call"]\n  content-visibility: auto; ...` —— 选择器列表缺少左花括号，整条规则被 CSS 解析器丢弃；且注入位于 HUD boot 内（HUD 默认关闭），只有显式开启 HUD 时才会应用。
2. **P1 assistant-step shadow 从未注册成功**：`registerAny = ctx.slots.register; registerAny(...)` 丢失服务实例（`this`），`register` 抛出 `Cannot read properties of undefined (reading 'effect')`；原 catch 为空，失败被完全隐藏；fiber 链证实官方 `AssistantNodeView` 一直是实际渲染者。
3. **注册优先级未赢得 cell**：即使注册成功，shadow 也必须在「lowest renders」规则下赢得 keyed cell；官方捕获还必须兼容 `React.memo` 组件（其 `typeof` 为 `object` 而非 `function`）。
4. **降载视图被否决**：第一版可工作的迭代以自定义「推理 (N 字符)」折叠加「完整渲染」按钮替代官方渲染，用户认为不好看，并要求同时兼顾美观与性能。

## Decision（决策）

将 assistant-step shadow 重构为保持观感的设计：

- 所有 assistant-step 节点一律经官方渲染器输出，与官方 UI 逐像素一致（无折叠、无按钮、无降载视图）。
- 对超重已结算消息（>20KB 文本或 localStorage 可调阈值），shadow 以 `data.status` 强制为 `running` 的 props 转交官方 600ms —— 官方流式分支本就不打 shiki（纯围栏样式，观感正常）；定时器随后翻回 settled，把高亮尖峰移出回合结束热路径。
- 官方渲染器在首次渲染时懒捕获（此时所有插件均已 apply），并排除影子自身条目；注册优先级取已有条目最小值再低 1 以赢得 keyed cell；register 调用绑定 slot 服务实例。
- P0 CSS 修复（缺花括号），并从 HUD boot 中抽出为跟随总开关的独立安装器。
- 所有 shadow/enable 失败路径由静默吞掉改为 warn 输出，另加每页一条诊断日志（注册优先级与投影胜者）。
- 新增客户端「会话尾部完整性观察探针」（perf-integrity.ts），监听 running→idle 边沿：核对最终 assistant-step 的 finalNode 是否缺失、窗口尾与主机 history 尾部 seq 是否落后、忙碌态点「停止」后的编辑框残留；发现写入 localStorage 环形缓冲（`dsh-perf-integrity-ring`）并 console.warn，绝不干预渲染。

## Alternatives considered（备选方案）

- **保留降载视图（折叠 + 完整渲染按钮）**：否决 —— 用户明确要求观感干净的同时仍然优化。
- **彻底移除 shadow、仅保留 P0 CSS**：可作为兜底，但会失去上游 F3/F4 结论中「长输出回合结束高亮尖峰」的延迟收益；保持观感的 shadow 保留该价值。
- **显式声明最高优先级注册**：否决 —— slot 契约文档为「lowest renders」且注册顺序无保证；min(existing)-1 的底值策略对两条分配路径都稳健。

## Consequences（影响）

- 超重消息的高亮尖峰不再落在回合结束时刻；样式与官方渲染完全一致。
- `content-visibility` 虚拟化在插件启用时默认生效，独立于 HUD。
- 完整性探针仅取证：正常回合无任何日志噪音（仅记录发现）。
- 上游 F3/F4（block 级 memo、尾窗渲染）才是单段长文本 O(n²) 的根治方案，属插件范围之外。

## Verification（验证）

- `pnpm --filter @linxin666/dsh-perf typecheck && pnpm --filter @linxin666/dsh-perf test`：通过（新增 6 条分类器单测）。
- 真实 GUI（DSH 0.1.1-rc.2）：fiber 链 `SlotOutlet -> StrictSessionEntry -> SlotErrorBoundary -> SessionEntry -> ContextualEntry -> PerfAssistantShadow -> AssistantNodeView -> AssistantMarkdown`；控制台诊断报告 shadow 为投影胜者；重型路径（阈值 120）以官方观感完整渲染 239 字最终内容、无降载 UI；消息行计算样式为 `content-visibility: auto`；旧版降载折页不再出现。
- 修复前未绑定 register 的失败以 `[dsh-perf] assistant shadow registration failed: ... (reading 'effect')` 暴露，修复后消失。
