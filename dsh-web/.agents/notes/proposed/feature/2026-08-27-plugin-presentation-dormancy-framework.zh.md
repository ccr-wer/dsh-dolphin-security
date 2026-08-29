# Agent Note: plugin presentation dormancy and lazy-materialization framework

Status: proposed

证据前置条件记录在 [dsh-perf attribution scoreboard](../../implemented/feature/2026-08-27-dsh-perf-plugin-attribution-scoreboard.md)。本 Note 同时固化探针阶段发现的官方 client-module 契约耐久事实——它们决定了「代码级懒加载」是否从插件可达。

## Problem

维护者提出：dsh-perf 能否给内置插件一套类似浏览器休眠标签页的驻留机制，以及真正的懒加载。目标文本刻意把实现门闸设在「证据充分」（无实测证明不做优化）。目前已知：

- 空闲页面对运行中 GUI 的测量：全部内置包的浏览器半区主线程自耗时合计每分钟不足约 25ms，且**零**稳态变更被归因到我们任何根节点。反复出现的写入者全部是动画循环（dsh-pet 换帧、皮肤状态小恐龙已清理、官方应用内部）。
- 官方 client-modules 契约事实（读自 DSH 0.1.1-rc.2 随附的 vendored `@deepseek-ai/dsh-client-modules` 源码）：脚本执行只*注册*各 bundle 的工厂（惰性 CJS 表）；模块体在首次 import 物化时运行并按包名记忆化；解析一个从未注册工厂的标识符会**大声抛错**。第三方包不存在把自己的物化延后到运行时决策的合规路径——那在 vendored 的 `EntryTree.import` 内部；bundle 到达与否只由 profile 的 bundle 列表决定。
- 挂载模式在最关键处已经按需：侧栏/磁贴注入（sidebar-entry-core 系列）在其表面打开时才物化 React 树，而不是启动时。

所以这个构想的两半干净地分开：

1. **代码级懒加载**——不动官方加载器就不可达；插件无法既晚到、又通过公开接缝惰性注册自己的工厂。
2. **展示半区休眠**——完全在插件边界内可达，但当前没有任何已被测出的成本可供节省：自家 UI 可见时的稳态开销可忽略，消息行与侧栏行已经吃上 `content-visibility:auto` 降载。

## Proposal

暂不构建框架。先把它和「启动实现的证据触发器」一起定义清楚：

- **范围（被触发时）**：仅*展示表面*的自愿加入式停靠。`shared/` 辅助模块注册 {root 元素, owner id, park(), wake()} 元组；协调者用 IntersectionObserver 观察可见性与文档 visibility；停靠即卸载（不是隐藏）、重入重挂载；绝不触碰服务注册——dispose 其他插件的服务会让依赖方启动失败（`slash` 事故现场）。
- **触发判据**：dsh-perf HUD act 计分板或 `__dshPerfAttribution` 句柄把持续（≥60s）≥20 节点/s 的新增速率、或合计 ≥30ms/墙钟秒的长任务来源，归因到某个插件拥有的 `[data-dsh-plugin]` 子树（多会话流式的代表性场景下）。出现一个违规者或一个带实测数字的采用者，本 Note 即可转入 implemented；否则保持 proposed。
- **明确非目标**：延迟 bundle 下载、动态拆分 client.js、触碰 `EntryTree`、中心化定时器仲裁。

## Alternatives considered

- **现在就把停靠框架建出来（投机式）**：被仓库自身规则否决——性能问题只认实测或用户报告；今天的数字显示这套框架能省的成本约为零。
- **页面内做 Chrome 式进程/标签页挂起**：不适用——页内脚本无法挂起事件循环或丢弃执行上下文；最接近的合法机制就是上面的子树卸载/重挂载。
- **向上游提第三方惰性物化特性请求**（如 loader 尊重的 `dsh.client.lazy` 声明）：值得在有具体包展示出可感知的启动成本后再记录上游；在那之前只会增加没人使用的协议面。
- **什么都不做、只让 act 计分板继续跑**：完全可接受的结果；计分板本身便宜（跟随 HUD 门闸），真出现热点时可以从本 Note 复活整套设计。

## Acceptance criteria

只有当上述触发判据带着可复现采集命中时才允许开工；未来的 implemented Note 必须附在本 Note 之后，并给出：入册表面在停靠态的变更速率降到零、唤醒恢复逐像素一致 UI、服务注册换手为零、启动画像不变，以及与 Phase-1 基线同一 CDP harness 的前后对比数字。

## Risks

过渡动画中途被停靠（弹层关闭途中被卸载）、快速划过时的唤醒延迟、观察器开销随入册面积增长、非公开挂载接缝的 API 漂移——任何探测不认识环境一律 fail-open。
