# dsh-perf 优化与设计理由报告

> 本报告以当前工作区 packages/dsh-perf 的源码、测试、bundle patch、构建产物与已实现 Agent Note 为主要证据，整理插件已经落地的性能优化、观测能力、设计理由、代价和验证边界。报告中的性能数字只代表对应测试环境与场景，不应直接视为所有机器上的保证值。

## 1. 结论摘要

dsh-perf 的实际性能优化集中在三条成本链路：Host 侧通过声明式 patch 降低流式写盘批次，浏览器侧通过 assistant-step shadow、重型度量和串行翻转队列错开昂贵的终态渲染，以及通过会话列表发布门控减少投影计数引起的侧栏整树重渲染。

消息行的 content-visibility 属于默认开启的浏览器降载，流式转发冷却属于默认关闭的实验项；PerfMeter、HUD 和会话尾部完整性观察器主要用于发现问题和保留证据，并不直接减少业务工作。

所有主动降载都遵循三个约束：不 fork DSH core、不替换官方视觉渲染器、不吞掉用户可见的语义变化；能延迟的昂贵工作被延迟或错峰，不能安全延迟的可见变化保持立即发布。

| 能力 | 分类 | 默认状态 | 主要目标 | 明确代价或边界 |
| --- | --- | --- | --- | --- |
| session-persistence-jsonl 写批延迟 | 实际降载 | bundle patch 始终声明 | 减少流式期 append 与 fsync 批次 | 崩溃丢失窗口由 200ms 扩到 500ms，且 patch 固定重述官方配置 |
| assistant-step shadow | 实际降载 | renderDegrade: true | 把重型 settled 渲染从回合结束热路径移开 | 终态高亮延后，重型消息会经历 running 形态到 settled 形态的两次渲染 |
| 加权 heavy 判定 | 实际降载的准入条件 | 随 shadow 开启 | 不漏掉代码围栏和公式密集型消息，也不过度处理 reasoning/tool-call | 权重和常数是成本估计，不是运行时成本模型 |
| settle 全局串行翻转队列 | 实际降载 | 随 shadow 开启 | 把多条消息的同帧高亮突发摊开 | 消息数量多时排队时间增加 |
| 会话列表发布门控 | 实际降载 | enabled 且 renderDegrade | 合并仅投影身份变化造成的整树通知 | 子代理 lineage 的 token 计数约每秒刷新一次，依赖非公开 store 形状 |
| content-visibility: auto | 实际降载 | 插件启用时默认开启 | 降低屏外消息行的布局和绘制压力 | 不是数据级虚拟化，120px 占位估计可能造成滚动估算偏差 |
| 流式转发冷却 | 实验性降载 | 默认关闭 | 减少流式期间官方 memo 渲染次数 | 文本会以更粗粒度跳动，存在可见差异 |
| PerfMeter、HUD、完整性观察器 | 观测与取证 | Host 观测默认开，HUD 默认关，完整性观察默认开 | 量化事件、事件循环、渲染长任务和尾部一致性 | 会产生采样、轮询或 history 探测成本，但不改变业务数据 |

## 2. 问题模型与基线

### 2.1 流式场景的主要成本链

当前实现针对的场景是多会话、多 subagent、assistant 流式输出和长消息混合出现的工作负载。每个增量事件可能同时触发事件总线 listener、持久化写入排队、状态投影、会话列表发布和浏览器渲染，因此总事件数并不等于用户能看到的内容变化数。

浏览器终态渲染的昂贵部分主要来自 settled 分支中的 Markdown 处理、代码围栏的 Shiki 高亮、公式的 KaTeX 处理以及 HTML 解析；官方 streaming 分支可以跳过 Shiki，但含公式的路径仍可能执行 KaTeX，因此本报告不把 running 形态描述为完全零成本。

会话列表的另一个问题是：官方 projectList 会在 manager flush 时重建列表快照对象，侧栏消费方订阅整个 store；当变化只有 projectionValues 身份变化时，侧栏可见字段并未变化，但对象身份仍会触发整树通知。

### 2.2 记录过的历史基线

以下数据来自 dsh-perf 原始研究阶段的内部 capture，环境为 DSH 0.1.1-rc.2、macOS 10 核/16GB，多会话和多 subagent 流式场景；它们是选择优化方向的基线，不是当前仓库的 CI 门槛，也不是跨机器的性能承诺。

| 并发场景 | 记录的 events/s | 记录的服务端事件循环 p99 | 用途 |
| --- | ---: | ---: | --- |
| 约 2 个会话 | 约 18 | 约 21ms | 低并发对照 |
| 约 5 个会话 | 约 168 | 约 129ms | 告警标准档附近的压力样本 |
| 约 11 个会话 | 约 907 | 约 163ms | 高并发和事件扇出压力样本 |

写盘研究还记录过单次 fsync 约 3.75ms、单批约 4.08ms，fsync 约占单批耗时的 92%；同一记录中的并发能力约为 724 批/s，而目标流量约为 16 批/s，因此本机线程池并未饱和。这个结果支持降低慢盘、网络卷和突发排队的暴露面，但不足以证明写批延迟是所有 UI 卡顿的主因。

## 3. 已实现的实际性能优化

### 3.1 声明式写批频控：降低流式期磁盘同步频率

#### 目标问题

session-persistence-jsonl 的 write-behind 后端会把事件批量 append 到 JSONL 并执行同步写盘；在持续流式输出时，较短的批次延迟会增加 append 与 fsync 的调用频率，并放大慢盘、网络卷或多个会话并发时的排队成本。

#### 实现方式

packages/dsh-perf/cordis.patch.yml 第 20-26 行以整行配置 patch 覆盖 session-persistence-jsonl，将 writeBatchMaxDelayMs 从官方默认 200ms 调整为 500ms，并显式重述 root、packChunks、compression 和 preparedSessionCacheSize。

packages/dsh-perf/src/index.ts 第 70-82 行将 500ms 记录为 BUNDLE_WRITE_BATCH_DELAY_MS，同时尽力读取运行时 persistence service 的实际 writeBatchMaxDelayMs，让 HUD 显示实际生效值而不是只显示插件预期值。

在稳定持续的流式负载下，500ms/200ms 是 2.5 倍的批次时间跨度，因此可以推导出批次数约减少到原来的 40%；这是调度周期的数学推导，不是一次完整端到端压测得到的 2.5 倍吞吐或卡顿改善。

#### 为什么这样优化

这里选择 patch write-behind 参数而不是修改持久化实现，是因为插件可以在不 fork core 的前提下改变成本频率，且不会改变事件格式、压缩方式或恢复流程。

#### 代价与风险

500ms 意味着进程在两次同步之间发生崩溃时，潜在未落盘窗口比 200ms 更长；该优化以少量耐久性时效换取流式期间更低的同步频率。

patch 采用整行替换而不是字段合并，因此把当前官方默认的其他字段一并钉死；官方后续调整这些默认值时，dsh-perf 需要同步审查 patch，否则升级后仍会继续使用旧值。

该优化只作用于持久化写批，不会减少 session/event 发射、structured clone、投影计算或浏览器每帧处理，因此不能单独宣称解决全部流式卡顿。

### 3.2 保持官方观感的 assistant-step shadow

#### 目标问题

长 assistant 消息在 settled 时集中执行完整 Markdown 处理、代码高亮、公式处理和 HTML 解析；会话打开或多步回合结束时，多条重型消息可能同时进入 settled 路径，形成单帧同步工作峰值。

#### 实现方式

packages/dsh-perf/src/client/perf-assistant-shadow.tsx 第 88-168 行注册一个 shadow 组件，但不自绘消息，也不创建折叠按钮；所有 assistant-step 最终仍交给官方 renderer，因而代码块、推理行、图片、按钮和主题样式继续使用官方实现。

当节点是 assistant-step、状态为 settled 且加权负载分超过阈值时，shadow 首次把传给官方 renderer 的状态临时改为 running；官方 running 分支会跳过 Shiki 高亮等终态工作，随后由翻转队列把节点恢复为 settled。含公式的 running 路径仍可能执行 KaTeX，这是需要保留的成本边界。

packages/dsh-perf/src/client/index.ts 第 181-227 行在渲染期懒捕获官方组件，排除 shadow 自身，并以现有 assistant-step 条目的最小 priority 减一注册，从而符合 keyed slot 的 lowest-renders 规则。注册调用显式绑定 ctx.slots，避免丢失服务实例。

#### 为什么这样优化

优化重点是把昂贵终态工作移出回合结束的热路径，而不是删掉高亮或改变最终视觉。采用官方 renderer 转发可以保留 DSH 的渲染语义，避免复制官方组件内部的 input、image、file mention 和 locale 状态。

自定义降级视图会折叠内容并增加额外按钮，虽然能减少成本却改变界面观感；当前实现选择延迟同一官方终态，而不是替换成另一种 UI。

#### 代价与风险

重型消息会先以官方 running 形态出现，终态高亮至少延迟 600ms，若队列中已有其他消息还会继续等待；该方案不是免费优化，并且会让同一消息经历轻量形态和终态形态两次渲染。

shadow 依赖 conversation.chat.node slot 的条目形状和 priority 语义；官方条目形状漂移时，注册失败应保持 fail-open，让官方 renderer 接管，而不是让消息消失。

### 3.3 加权 heavy 判定：把昂贵结构纳入准入条件

#### 目标问题

只累计纯文本字符会漏掉代码围栏密集但总字符数不高的消息，也会把大量 reasoning 和折叠的 tool-call 参数当作与正文同等昂贵的内容。聊天代码块没有固定的行数上限，围栏内部的解析和高亮成本不能只用正文字符数近似。

#### 实现方式

packages/dsh-perf/src/client/perf-heaviness.ts 第 21-67 行的 scoreBlocks 使用等价字符分计算渲染负载：普通 text 字符按 1 计，代码围栏字符额外再计 1，公式按固定成本计入，reasoning 按 0.2 倍计，tool-call 的 argsRaw 按 0.25 倍计。

公式数量按双美元定界符对和左方括号定界符的出现次数估算，每个公式使用 FORMULA_WEIGHT = 1000；定界符使用 indexOf 扫描，避免为了公式计数引入灾难性回溯。

默认阈值为 20000，读取自 dsh-perf-shadow-threshold；阈值只决定消息是否进入 shadow 延迟路径，不会截断、删除或改写消息内容。

#### 为什么这样优化

代码围栏和公式触发的固定处理成本比普通文本更集中，reasoning 和折叠 tool-call 的终态成本相对低；加权分能在不引入官方 renderer 副本的情况下，使用消息结构做更贴近成本的准入判断。

#### 代价与证据边界

FORMULA_WEIGHT = 1000、reasoning 0.2、tool-call 0.25 和围栏双倍计权是基于 bundle 审计的工程估计，不是每台机器实时采样拟合出来的模型；阈值可能存在误报或漏报，本报告不把它描述为精确成本预测。

packages/dsh-perf/tests/heaviness.spec.ts 覆盖代码围栏、公式、reasoning、tool-call、空字段和病态定界符输入，其中病态输入测试确认扫描不会在测试阈值内失控。

### 3.4 settle 全局串行翻转队列：消除同帧突发

#### 目标问题

如果每条 heavy 消息各自持有一个 600ms 定时器，同一时间 settled 的 N 条消息会在同一帧一起翻回 settled，重新触发 N 份完整 Markdown、Shiki、KaTeX 和 HTML 解析工作。

#### 实现方式

packages/dsh-perf/src/client/perf-flip-queue.ts 第 18-80 行提供模块级 FIFO 队列；每项入队时记录 eligibleAt = 入队时间 + delayMs，保持原本至少 600ms 的终态延迟，队列每次只执行一个翻转，且相邻翻转至少间隔 intervalMs。

当前默认 delayMs 为 600ms，intervalMs 默认 120ms，可通过 dsh-perf-flip-interval 调整；组件卸载时调用 enqueue 返回的取消函数，避免已销毁组件仍触发状态更新。

#### 为什么这样优化

这里不减少终态工作总量，而是把同步峰值转换为多个可绘制、可响应输入的时间片；原有最小延迟被保留，避免把轻量消息和重型消息的用户感知顺序完全改写。

#### 代价与验证

队列会把 N 条消息的完成时间拉长到至少 N 个间隔，消息多时最后一条高亮会更晚出现；最终 settled 视觉不变，变化只在翻转时机。

packages/dsh-perf/tests/flip-queue.spec.ts 覆盖单条延迟、同刻多条按间隔翻转、取消和晚入队顺序；已记录的真实 GUI 调试样本中，4 条 heavy 消息逐条翻转，测试场景观测到没有超过 50ms 的 longtask，但这不是全面 benchmark。

### 3.5 会话列表发布门控：合并投影身份变化

#### 目标问题

官方会话列表 flush 会重建 ids、byId、current、phase、subagentsByParent、jobsBySession 和 currentAddress 等快照；流式期 usage/token 投影会不断改变 projectionValues 身份，即使侧栏标题、运行状态、顺序和徽标都没变，也会让整个列表 store 通知订阅者。

#### 实现方式

packages/dsh-perf/src/client/perf-list-gate.ts 第 48-118 行比对侧栏可见字段，唯一豁免 byId 条目的 projectionValues 身份；同时比对 ids 顺序、current、phase、currentAddress 以及子代理和任务表的内容。

packages/dsh-perf/src/client/perf-list-gate.ts 第 134-188 行将 sessions.list.set 分成两类：存在可见变化时立即发布最新快照并作废挂起值；只有 projection identity 变化时保存最新快照，使用默认 1000ms 的尾部定时器补发。

packages/dsh-perf/src/client/index.ts 第 240-282 行以方法级 patch 安装门控，不替换 store 对象；安装带有 __dshPerfGate 标记，HMR 或双源加载时幂等，dispose 时恢复原始 set 并补发挂起快照。

#### 为什么这样优化

优化的是通知频率而不是业务状态：token 投影仍持续由官方逻辑产生，门控只延后对侧栏不可见的身份变化；标题、running、updatedAt、顺序、current、phase、子代理徽标和任务信息一旦变化仍立即到达 UI。

选择方法级 patch 是因为官方内部调用共享同一个 sessions.list store；这样可以覆盖官方 this.list.set 调用点，同时不创建第二个 store，也不需要改动 DSH core。

#### 代价与风险

子代理 lineage 头部的 token 计数从每个 usage frame 刷新为约每秒刷新，这是该方案唯一预期的可感知延迟。

门控依赖非公开的 sessions.list 形状；若版本升级导致 set 或 getSnapshot 不存在，安装会记录 warning 并跳过，保持 fail-open，但该版本不会得到门控收益。

已记录的活动流样本中，30 秒内 30 次无效整树发布被合并为 3 次尾部补发；这是特定账号和场景的计数证据，不应直接换算为所有环境的渲染时间收益。完整侧栏 GUI 视觉验证在同一记录中被延期，因此这里不宣称端到端视觉验收已经完成。

packages/dsh-perf/tests/list-gate.spec.ts 覆盖可见字段立即发布、projection-only 合并、可见变化取消挂起补发和 dispose 生命周期，共 10 条测试。

### 3.6 content-visibility：对屏外消息行近似虚拟化

#### 目标问题

长会话中大量屏外 assistant-step 和 tool-call 行仍然存在于 DOM；即使用户看不到它们，布局、绘制和部分样式计算仍可能参与每帧工作。

#### 实现方式

packages/dsh-perf/src/client/index.ts 第 291-315 行在插件启用且未设置 dsh-perf-css=off 时单例注入：assistant-step 和 tool-call 消息行使用 content-visibility: auto，并设置 contain-intrinsic-size: auto 120px。

该样式安装已从 HUD boot 中独立出来，因此 HUD 默认关闭时仍会生效；CSS 安装器在总开关关闭时移除 style 节点，避免配置关闭后残留降载规则。

#### 为什么这样优化

这是不改变消息数据形状、官方组件和滚动容器的低侵入方案；浏览器可以跳过屏外内容的部分渲染工作，同时保留真实 DOM 和官方节点结构。

#### 代价与边界

它是浏览器渲染层的近似虚拟化，不是列表数据分页或真正的 DOM 回收；120px 只是占位估计，可能造成滚动条长度和跳转位置估算误差。当前报告没有把它写成已测得的固定 FPS 提升。

## 4. 实验项与默认关闭能力

### 4.1 流式转发冷却

packages/dsh-perf/src/client/perf-assistant-shadow.tsx 第 63-73 行和第 115-146 行支持通过 dsh-perf-stream-cooldown 设置毫秒窗口；窗口内 shadow 继续接收最新节点，但转交给官方 memo renderer 的仍是上一次节点引用，窗口结束由 trailing timer 追平。

这样做的理由是利用官方 memo(assistant-step) 的引用相等判断，减少流式期间每个增量都进入官方渲染器的次数；但用户看到的文本会以更粗粒度跳动，属于明确的可见差异，因此默认值为 0，也就是关闭。

该能力是调试和实验旋钮，不应与默认开启的 shadow、列表门控和 CSS 降载混为一谈；当前没有专门的组件级自动化测试覆盖其视觉追平行为。

### 4.2 其他可逆调试旋钮

 dsh-perf-shadow-threshold、dsh-perf-flip-interval 和 dsh-perf-list-coalesce 可用于现场调参；dsh-perf-css=off 可关闭 CSS 降载；dsh-perf-debug=1 会暴露 window.__dshPerfListGate 计数并输出翻转日志；这些 localStorage 值不是稳定的用户配置契约。

## 5. 观测、告警与取证能力

### 5.1 Host PerfMeter：量化负载而不是改变负载

packages/dsh-perf/src/host/perf-meter.ts 第 59-248 行订阅 session/event，按会话累计事件数、总速率和事件类型分布；同时订阅 agent/status 保存 idle/running 状态，并用 monitorEventLoopDelay({ resolution: 10 }) 采集事件循环 mean、p99 和 max 延迟。

采样以 meterIntervalMs 将 pending 事件归档到窗口 bucket，窗口外 bucket、会话类型和状态会被清理，避免观察数据无界增长；snapshot 还返回进程 RSS、heap、top sessions 和当前告警状态。

mode: off 会停止事件订阅和事件循环监控，但 PerfMeter.start() 仍会创建采样 interval，stats 路由也仍可返回快照，因此 off 不是绝对零成本，只是停止主要观测工作。

告警预设位于 packages/dsh-perf/src/index.ts 第 47-68 行：light 为 10 个会话/1000 events/s，standard 为 5/300，strict 为 3/150；阈值采用大于等于触发。

### 5.2 HUD：把服务端和浏览器指标放到同一现场

packages/dsh-perf/src/client/index.ts 第 317-496 行的 HUD 默认关闭；打开后每 2 秒轮询 /api/dsh-perf/stats，显示 events/s、活跃会话、事件循环 p99/mean、RSS/Heap、实际写批延迟和 top sessions，并在浏览器侧采样近 1 秒 FPS 与近 60 秒 longtask 数量。

连续 3 次请求失败会隐藏 HUD，host 半区缺失、版本漂移或浏览器不支持 longtask 时静默降级；HUD 轮询本身约为 0.5 requests/s，所以它是诊断工具而非默认优化。

### 5.2.1 按插件活动度归因计分板

`perf-attribution.ts` 用一个合并的 body MutationObserver 把每个变更节点解析到最近的 `data-dsh-plugin` 根（语义属性契约约定），按固定时间网格桶累计新增节点速率，HUD 渲染 Top 3 插件加 rest 一行。采样跟随 HUD 开关生命周期，HUD 默认关闭时零成本；长任务从「按回调记一条」改为逐条入环并携带 best-effort 来源标注与耗时。

语义边界刻意保持谦卑：速率为墙钟口径，空闲时间会稀释读数——这有利于识别长期持续成本，不适合宣称瞬时峰值；超出单次回调预算的节点与无语义属性根的节点共用 unattributed 桶，未打属性的插件在该桶里显形是设计意图而不是缺陷。`dsh-perf-debug=1` 时暴露 window.__dshPerfAttribution 调试句柄（快照、长任务记录、来源汇总）。该能力的验证目前限于单元测试（分类、轮转、速率数学、budget 溢出、jsdom 接线共 12 条），尚未在运行中的 GUI 完成视觉验收。

### 5.3 会话尾部完整性观察器：定位“执行完成但尾部未显示”

packages/dsh-perf/src/client/perf-integrity.ts 第 119-211 行订阅 sessions.list，在会话 running 到 idle 的边沿执行只读检查：settled 的最后一个 assistant-step 是否缺少 finalNode，Host history 尾部的 assistant/message seq 是否领先窗口最后节点，以及 idle 后编辑框是否仍有草稿。

发现会写入 dsh-perf-integrity-ring 的最多 24 条 localStorage 环形记录并输出 console.warn，同一会话和类别有 30 秒冷却；观察器不修改渲染、不补消息、不触发恢复动作，任何 service、history 或 DOM 探测失败都静默跳过。

它的理由是给“跑完但最后内容没显示”“停止后草稿残留”等问题留下可复盘证据，而不是把不确定的客户端状态强行修正；代价是每次回合结束最多执行一次 history({ maxMessages: 50 }) 探测和一次 DOM 查询。

### 5.4 Stats 路由与安全边界

packages/dsh-perf/src/host/routes.ts 第 7-22 行只暴露聚合指标，不返回会话内容；packages/dsh-perf/src/host/loopback.ts 第 19-30 行同时检查 socket loopback 地址、Host loopback、sec-fetch-site 和 Origin，响应使用 no-store。这保证观测能力不会把会话正文扩展成新的远程数据面。

## 6. 当前配置与运行语义

| 配置或旋钮 | 当前默认 | 作用 |
| --- | --- | --- |
| enabled | true | 总开关；关闭后 Host meter/route 停止，客户端 HUD、完整性观察和 CSS 降载按生命周期退出 |
| mode | balanced | off、balanced、aggressive；当前代码只有 off 与非 off 的行为分支，aggressive 与 balanced 尚无实现差异 |
| meterIntervalMs | 2000 | Host 采样周期，schema 限制为 1000-60000ms |
| statsWindowSeconds | 120 | Host 统计窗口，schema 限制为 10-3600 秒 |
| alertPreset | standard | 会话数与事件速率阈值选择 |
| hudEnabled | false | 浏览器 HUD，默认不增加轮询和 FPS/longtask 采样 |
| renderDegrade | true | assistant shadow、翻转队列、列表门控的总开关；CSS 降载仍跟随 enabled |
| bundle writeBatchMaxDelayMs | 500 | patch 声明的 persistence 写批最大延迟 |
| dsh-perf-shadow-threshold | 20000 | weighted score 超过该值才进入 heavy 延迟路径 |
| dsh-perf-flip-interval | 120 | heavy settled 翻转之间的最小间隔，单位毫秒 |
| dsh-perf-list-coalesce | 1000 | projection-only 会话列表发布的尾部合并窗口，单位毫秒 |
| dsh-perf-stream-cooldown | 0 | 流式转发冷却；0 表示默认关闭 |
| dsh-perf-css | 未设置 | 设为 off 可关闭 content-visibility 降载 |
| dsh-perf-debug | 未设置 | 设为 1 开启 gate 计数、翻转日志和调试句柄 |

设置卡通过 packages/dsh-perf/src/client/perf-settings-card.tsx 暴露总开关、模式、告警预设、HUD 和渲染降载开关；Host 侧在 packages/dsh-perf/src/index.ts 第 84-126 行复用现有 meter 并热应用采样和模式变化，避免设置每次变化都重复创建订阅。

## 7. 验证证据与证据等级

### 7.1 直接代码和单元测试证据

| 范围 | 证据 | 能证明什么 | 不能证明什么 |
| --- | --- | --- | --- |
| 加权判定 | packages/dsh-perf/tests/heaviness.spec.ts，8 条 | 结构计分、低权重和病态定界符输入的逻辑契约 | 权重是否适合所有真实消息和机器 |
| 翻转队列 | packages/dsh-perf/tests/flip-queue.spec.ts，4 条 | 延迟、FIFO、间隔、取消语义 | 浏览器主线程真实长任务分布 |
| 列表门控 | packages/dsh-perf/tests/list-gate.spec.ts，10 条 | 可见变化立即发布、投影变化合并、dispose 恢复 | 所有官方侧栏组件的端到端视觉结果 |
| 归因计分板 | packages/dsh-perf/tests/attribution.spec.ts，12 条 | 分类归因、窗口轮转与墙钟速率、budget 溢出、jsdom 观察器接线 | 真实页面上各插件速率分布与长任务来源标注覆盖率 |
| 完整性分类 | packages/dsh-perf/tests/integrity.spec.ts，6 条 | finalNode 缺失和 stale-tail 分类器 | 真实网络、历史接口和 DOM 现场的发现率 |
| 包级门禁 | Agent Note 记录的 test、typecheck、build、docs:check | 当前实现可构建、类型可检查、纯逻辑测试通过 | 未覆盖的 Host、React 组件和视觉回归 |

当前包的测试总计为 40 条：heaviness 8、flip-queue 4、list-gate 10、integrity 6、attribution 12；测试集中在纯逻辑模块，Host PerfMeter、shadow React 组件和端到端视觉没有同等强度的自动化覆盖。

### 7.2 真实 GUI 记录

已记录的真实 127.0.0.1:3080 GUI 检查观察到 assistant shadow 成为 conversation.chat.node 的 projected winner，重型路径仍通过官方组件呈现，消息行计算样式包含 content-visibility: auto；翻转队列样本显示 4 条 heavy 消息逐条翻转，列表门控样本显示 30 秒内 10 次立即发布、30 次合并和 3 次尾部补发。

同一验证记录明确指出，因并发会话修改 profile 导致完整 Web boot 受阻，侧栏门控的完整 GUI 视觉验证被延期；因此本报告只把列表门控的逻辑和计数器作为证据，不宣称已完成全量端到端视觉验收。

shadow 的视觉一致性也只有单样本 headless CDP 检查，没有自动化截图 diff 或多种消息类型的视觉回归；“最终像素保持官方一致”是实现设计和已检查样本的目标，不是覆盖所有内容形态的统计结论。

### 7.3 证据解读规则

200ms 到 500ms 和约 2.5 倍批次跨度是调度参数推导；30 次到 3 次是一个活动流样本的发布计数；4 条消息和零大于 50ms longtask 是一次 GUI 样本；这些数字不能合并成一个统一的“整体性能提升百分比”。

## 8. 插件边界：没有在 dsh-perf 中实现的优化

以下问题在研究中被确认具有优化价值，但正确归属是 DSH core 或官方 renderer，当前没有被 dsh-perf 伪装成已实现能力。

1. 发射侧事件聚合、push frame batching、session firehose listener 扇出治理属于 core 的 agent-loop、client-runtime 或连接层；插件只观察和治理可到达的消费侧，不替换事件发射协议。
2. ConversationRoot 的整对象订阅和输入栏重渲染应由官方组件改为字段级 selector 与 memoized InputBar；slot shadow 无法复制官方闭包中的 inputHub、submissionPolicy 和 views。
3. 单个巨大、无换行的 text block 导致增量解析尾部窗口停在 0，真正的 block-level memo 或 tail-window rendering 需要进入官方 renderer；插件拆分 block 会改变官方 Markdown 间距和语义。
4. subagent.history 和 session.history 的压缩、projection-first load、按 chunk 分页属于 Host 协议和 persistence API；完整性观察器只做小窗口探测，不改变 history 数据面。
5. Shiki 全局语言 generation 引起的全页重高亮、KaTeX 公式缓存、locations.touch 的复杂度和底部滚动强制布局属于官方 bundle 内部优化，当前报告不将它们计入 dsh-perf 已完成项。

不在插件内实现这些项目的原因不是它们没有收益，而是插件缺少稳定的官方 ownership、slot 输入和数据协议；在错误层级复制实现会引入视觉漂移、状态不一致或升级脆弱性。

## 9. 需要持续关注的风险与后续测量

1. 为写批延迟建立崩溃恢复和慢盘/网络卷基准，分别测量 fsync 次数、写入延迟、事件丢失窗口和 UI 事件循环，避免把写盘频控泛化为 UI 卡顿修复。
2. 为 shadow 建立多内容类型回归：代码围栏、公式、图片、tool-call、reasoning、长文本、连续多 step，并记录高亮完成延迟、长任务分布和截图差异。
3. 为列表门控增加官方侧栏端到端验证和版本漂移探测，确认 current、running、标题、updatedAt、徽标和搜索结果在门控下仍保持即时更新。
4. 重新评估 weighted score 常数和阈值，最好用实际 Shiki/KaTeX 运行时间拟合，而不是把审计估计长期固化为成本真值。
5. 明确 mode: aggressive 的实现差异；当前它与 balanced 行为相同，只是配置选择器中的兼容性档位，不应在文案中暗示更强的降载。
6. 补充 Host PerfMeter 的单元测试和 mode: off 生命周期测试，特别验证 interval、订阅、route 和内存清理的实际关闭语义。
7. 继续把完整性观察器视为证据采集而不是自动修复；如果 history 探测成本在高频会话中可见，应增加采样率或按需开启的配置。

## 10. 证据索引

| 主题 | 主要源码 | 测试或决策记录 |
| --- | --- | --- |
| 写批频控 | packages/dsh-perf/cordis.patch.yml 第 1-26 行；packages/dsh-perf/src/index.ts 第 70-82 行 | Git 提交 ce24b680c 及当前 bundle patch |
| assistant shadow 与 CSS 修复 | packages/dsh-perf/src/client/index.ts 第 181-227、291-315 行；packages/dsh-perf/src/client/perf-assistant-shadow.tsx 第 88-168 行 | .agents/notes/implemented/bug-fix/2026-08-26-dsh-perf-render-shadow-rework.md |
| 加权 heavy 与翻转队列 | packages/dsh-perf/src/client/perf-heaviness.ts；packages/dsh-perf/src/client/perf-flip-queue.ts | packages/dsh-perf/tests/heaviness.spec.ts；packages/dsh-perf/tests/flip-queue.spec.ts；.agents/notes/implemented/feature/2026-08-26-dsh-perf-render-pipeline-batch2.md |
| 列表发布门控 | packages/dsh-perf/src/client/perf-list-gate.ts；packages/dsh-perf/src/client/index.ts 第 240-282 行 | packages/dsh-perf/tests/list-gate.spec.ts；同一 batch 2 Agent Note |
| 归因计分板 | packages/dsh-perf/src/client/perf-attribution.ts | packages/dsh-perf/tests/attribution.spec.ts；attribution scoreboard Agent Note |
| 完整性观察 | packages/dsh-perf/src/client/perf-integrity.ts | packages/dsh-perf/tests/integrity.spec.ts；render shadow Agent Note |
| Host 观测与 route | packages/dsh-perf/src/host/perf-meter.ts；packages/dsh-perf/src/host/routes.ts；packages/dsh-perf/src/host/loopback.ts | packages/dsh-perf/README.md 的 HUD 与边界说明 |
| 优化提交边界 | Git 提交 539b77cdc、be326694b、088129962 | 对应 Agent Note 与测试记录 |

本报告只描述当前 dsh-perf 插件已经拥有的实现和可追溯证据；core 侧建议、临时研究文件和未验证的性能推断均按边界或证据限制单独标注。