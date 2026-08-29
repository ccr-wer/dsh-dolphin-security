# Agent Note: orca-link status character dead write surfaces removed

Status: implemented

Supersession check: 没有活跃 Note 拥有状态小恐龙帧循环；[performance-guidelines-v1](../../../packages/skins/skin-center/contracts/performance-guidelines-v1.md) 的 R3/R5 是「规则」属主，但没有任何 Note 记录这个 hook 的合规状态。hooks 成本的实测案例研究仍由契约文档自身承载。

## Problem

一轮测量（外部 CDP timeline + 页面内写入原语指纹）显示空闲主线程的开销在 JavaScript 之外：每秒约 93 次样式重算、UpdateLayoutTree 20 秒 653ms，驱动力是 DOM 写入而不是任何插件脚本。指纹定位到两个动画系统；皮肤侧的这个就是 orca-link 状态小恐龙：

- `render()` 每个 tick 在容器和 sprite 上各写 4 个 CSS 变量（`--orca-status-column/row/x/y`），而整份样式表消费的只有 `.orca-ch-statusCharacterSprite` 的 `--orca-status-x/y`（图集步进的 background-position）。八次写入里六次零消费者。
- 每个 tick 还经守卫翻转一个 `data-orca-link-frame` 属性——全仓审计没有任何样式或脚本读它。
- 无意义的每次 `setProperty` 都是一个样式重算面（契约 R3 明文禁止写无人消费的变量）；空闲页面每秒为没人读取的像素支付 4-6 帧的重算与绘制链成本。

## Decision

容器层现在只保留有消费者的镜像：

- `data-orca-link-status` 保持受守卫的属性写入（气泡符号与织纹样式在读它）。
- `data-orca-link-frame`、容器级 `--orca-status-*`、sprite 级 `--orca-status-column/row` 一律不再写。
- 存活的两条 sprite 写入加读前守卫：同帧重复渲染直接跳过（状态切换本来就会重置帧序）。
- 规格断言从为死变量背书改为断言权威信号：sprite 的 `--orca-status-x` 非空、容器的 column 为空。

按构造视觉输出不变：合成出的 background-position 与对齐 transform 由相同输入计算，消失的只是无人消费的写入。

## Alternatives considered

- **把 background-position 步进迁移到纯合成 transform 动画**：否——对齐偏移已经走 transform，图集步进本质是重绘（R3 记录了原因）；换技术会改变渲染语义，收益边际且违背「视觉一致性优先」。
- **空闲时暂停循环**：否——角色的存在意义就是环境反馈；reduced-motion 与隐藏页暂停已存在。
- **保留死写入只优化 dsh-pet**：否——两者在同一 20 秒窗口被测量；砍一半写入面是免费、受测试保护的清理。

## Consequences

- 每 tick 写入面从 8 次 setProperty 加 2 次属性写降到 2 次带守卫的 setProperty 加一次仅状态更新的属性写；对约 93 次/秒重算风暴的实测削减待重建后的 GUI 可运行时记录（已安装皮肤走副本供应，重装/重启是实测门闸，与同日交付的 dsh-perf 归因构建一致）。
- 后续读者不要重新引入容器与 sprite 之间的变量镜像：若样式表将来需要容器作用域值，必须与其消费者一起落地。

## Testing

- `tests/orca-link-hooks.spec.ts`：保留状态镜像断言；新增显式断言 sprite 带 `--orca-status-x` 而容器无 `--orca-status-column`。包全套通过（585/585）；hooks.mjs 过语法检查；现场前后对比数字因上述重装门闸延后。
