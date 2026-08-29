# Agent Note: orca-link 会话切换延迟修复

Status: implemented

## 问题

用户反馈：ORCA LINK（orca-link）皮肤在加载会话、切换 Session、新建任务与 `/` 调出 skill 选择器时明显卡顿，而默认皮肤或其他皮肤明显更快。基线排除了 DSH 核心：皮肤在页面中附加了其他皮肤没有的客户端运行时。对 `packages/skins/skin-center/skins/orca-link/hooks.mjs` 与 `patches.css` 的静态分析找到了放大链路：

- 12 个 body 级 MutationObserver，每次 DOM 变更批次都做全树扫描（`conversationRootOf` 遍历所有 `[data-phase]` 节点，composer seat 重跑含 `getBoundingClientRect` 读取的 `mountBinding`）——会话加载/切换一次插入数百节点，要付出 12 次全量扫描加布局工作的代价。
- 图标重绘器先克隆 svg，再用逐 key `includes()` 循环把每个新插入的 SVG 与约 90 条路径指纹匹配。
- 全视口场景层带 `will-change: opacity, transform, filter`，GPU 合成层永久驻留；交叉淡化还会过渡 filter。
- 状态角色帧循环每 83ms 一跳，`orca-ch-orcaGateWeave` 无限 steps 动画在标签页隐藏时也持续运行。

## 决策

实施四项行为等价的优化（视觉、语义属性与清理契约均不变）：

1. 图标匹配：把指纹表编译为一个交替正则作为布尔预筛（`iconKeyRegex.test`）——每个 svg 从约 90 次 `includes()` 降为单次线性扫描。名称仍由有序 key 表决定，保持"表中首个命中 key"优先级不变。未挂 art 的新鲜 svg 直接读取 `innerHTML`，跳过克隆/剥离 art 的步骤。
2. 会话根共享缓存：`conversationRootMemo()` 缓存定位到的根并在 `isConnected` 期间复用；会话切换会重建根，旧节点断开后下一次回调重新定位。场景同步与链接状态同步共用该缓存。
3. composer 折叠 `mountBinding` 短路：seat 绑定的 card、root、phase、handles 均未变化时回调在 phase/compose 检查前直接返回；收起态仍会重新锚定恢复按钮。`mountedPhase` 记录在绑定对象上。
4. 角色后台节流：`visibilitychange` 在隐藏时清除待执行帧定时器，恢复时从当前序列索引继续；隐藏状态镜像到 `body[data-orca-page-hidden]`，样式表将无限 gate-weave 动画暂停（`animation-play-state: paused`）。场景层与词标移除 `will-change`，空闲时全视口层不再驻留 GPU 合成层（过渡期间仍会自动提升）。

被放弃的小项如实记录：删除 `--orca-status-column` / `--orca-status-row` 写入本来在计划内，但现有测试断言其存在且无法排除外部 CSS 消费，且未证明有可观测浪费，故未做。

## 备选方案

- **皮肤内轻量模式开关**（按设置停用角色/场景/图标模块）：本变更拒绝。v2 皮肤清单没有设置面；新增需要契约扩展加 UI，范围远超所报告的缺陷。
- **角色动画改用合成器 transform 重构**（替代 `background-position`）：价值高，但图集对齐需在全部 10 个状态行做截图级视觉验证；留作二期候选，本次未交付。
- **不动皮肤**（用户换皮肤）：被拒绝——用户看重的是这款皮肤的观感；修复目标是无用开销而非设计。

## 影响

前台行为视觉完全一致：场景交叉淡化、角色帧、图标 art 与信号 chip 均照旧。隐藏标签页不再空烧帧循环与 weave。会话加载/切换的每批次成本从"12 次全树扫描 + 每 svg 90 键匹配 + 布局读取"降为短路与缓存查找。面向皮肤作者的规则固化在 `packages/skins/skin-center/contracts/performance-guidelines-v1.md`，未来的皮肤继承同一纪律。sprite transform 重构仍开放；移植决策（[orca-link v2 皮肤移植](../../feature/2026-08-25-orca-link-v2-skin-port.md)）保持不变：本修复是等价优化而非行为减配。

## 验证

- `pnpm --filter @linxin666/dsh-client-ui-skin-center test` —— 32 个测试文件、561 个测试通过（新增 2 个：指纹匹配等价性/幂等、标签页可见性节流）。
- `pnpm --filter @linxin666/dsh-client-ui-skin-center typecheck`。
- skin-center 检查、market 构建产物重建与真实 GUI 数据记录在变更 PR 中。
