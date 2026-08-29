# Agent Note: dsh-perf plugin activity attribution scoreboard

Status: implemented

Supersession check: 活动树中没有覆盖「按插件成本归因」的既有 Note；机制上最接近的是 render pipeline batch 2（[batch 2](../feature/2026-08-26-dsh-perf-render-pipeline-batch2.md)）与 shadow rework，两者治理的都是官方管线成本而非按归属插件归因。本 Note 为该决策的新属主。

## Problem

dsh-perf 能测量浏览器侧整体负载（FPS、长任务数）并治理两条已知热路径（消息渲染、会话列表发布），但回答不了「我们自己的哪个插件此刻很忙」。batch 2 审计发现第三方成本靠的是手工 DOM 考古（better-sidebar 的行挂载突发、dsh-annotation 的 1Hz 全文档扫描）；随着 [packages/](../../../../packages/AGENTS.md) 下内置插件家族扩大，稳态排名必须成为可观测能力而不是口口相传。用户侧的另一个目标——插件级懒加载与类 Chrome 标签页休眠——在设计任何休眠调度器之前，需要的正是这份排名作为证据基础。

## Decision

- `perf-attribution.ts` 新增一个挂在 `document.body` 上的合并 `MutationObserver`（childList+subtree），把每个新增元素/文本节点解析到最近的 `[data-dsh-plugin]` 根——即 [semantic-attrs-v1](../../../../packages/skins/skin-center/contracts/semantic-attrs-v1.md) 语义属性契约——按固定时间网格桶（2s 窗口，保留 8 个 ≈16s 回看）累计节点速率；HUD 渲染一行 `act`：Top 3 插件加合并的 `rest=` 速率。
- 长任务不再按观察器回调记一条（旧实现对批量送达只计一次），改为逐条进入环形记录，附耗时与规范里的 best-effort 容器名（缺失时 'unknown'）。HUD longtask 行增加最大耗时；`topSources()` 按累计耗时聚合来源。
- 语义刻意保持谦卑：速率是保留网格上的墙钟口径，空闲时间主动稀释读数（有利于长期持续成本、不利于瞬时尖峰）；超出单次回调 400 节点分类预算的溢出与无语义根的节点共用一个 unattributed 桶，且计入总量——全未归因页面也读得到非零值。不发 `data-dsh-plugin` 的插件因此以「可见性欠债」的形式显形，而不是静默为零。
- 一切跟随现有 HUD 生命周期：默认关、随 HUD 销毁，`dsh-perf-debug=1` 时暴露与列表门控同款的调试句柄 `window.__dshPerfAttribution`。分类与桶运算为纯函数、时钟可注入；`index.ts` 只负责 DOM 与渲染接线。

## Alternatives considered

- **在 dsh-perf 内做 Chrome tracing / CDP CPU profiling**：常驻路径上被否——在被观测页面内部剖析会改变观测对象，导出体积也无法作为常驻工具。CDP 继续作为测量会话的外部真值来源。
- **经栈采样做脚本级归因**：否决——除规范定义的 attribution container 外，「这条长任务是谁造成的」没有同步 API，且容器名经常为空；为标签质量问题加常驻采样开销不划算，而 `data-dsh-plugin` 根已经解决了它。
- **monkeypatch 平台 API 给每个插件的 effect/microtask 计时**：否决——patch 共享平台 API 违反仓库边界（跨插件协作走 cordis 服务与 slot，不做值导入拦截），且框架自身的功劳会被记到最后一个 patch 的插件头上。
- **让 dsh-perf dispose 其他插件的服务来休眠它们**：直接否决——服务缺失会让依赖方启动失败（profile 编辑导致 `slash` 无人提供的现场已经出现过），未来任何休眠特性只能停靠展示层表面。计分板负责度量，不动手。

## Consequences

- 成本落在 client 半区，且仅在 HUD 开启时运行；默认配置不变时没有任何额外的轮询或观察。
- 排名粒度受语义属性采纳度约束：未打 `data-dsh-plugin` 的包会混进同一个桶，直到采纳契约——这个欠债现在变成可直接测量的数字。
- 墙钟稀释意味着单次突发帧不会独占整行；最坏长任务经由 max 字段和调试来源列表保持可见。
- 计分板是后续懒加载/休眠设计的前置证据层：这类提案必须从实测 Top-N 插件成本出发，且只能治理展示层表面。

## Testing

- `tests/attribution.spec.ts` 共 12 条：同网格累计、跨窗口轮转与墙钟速率、unattributed 与 top-N/rest 恒等式、保留裁剪、同分稳定排序、budget 溢出、jsdom 接线（元素与文本节点归因、dispose 后重装）、NaN 时钟失败开放、长任务环计数/最大值/来源合并、来源标签回退。包级门禁：vitest 41/41、typecheck、build 全部通过；运行中的 GUI 在用户重启前继续供应旧 bundle，故该 HUD 行的现场视觉验收延后，与报告的证据规则一致。
