# Agent Note: 从 dsh-deep-whale 移植 orca-link v2 皮肤

Status: implemented

## 问题

dsh-deep-whale 仓库（Small-tailqwq/dsh-deep-whale）为 DSH Web GUI 提供两款鲸鱼娘皮肤的
v1 cordis 插件（maid-atelier 与 orca-link），客户端代码很重。maid-atelier 已在作者合作下
移植进入 v2 皮肤集合；本次用户要求把 orca-link 以「完整版」（全部行为，非静态层减配）
收录进来，并先确认许可链。作者确认在 CC BY-NC-SA 4.0 下可以收录——这也正是美术作品方
的条件（鲸鱼娘原作 上善；本皮肤署名链为 上善 → Small-tailqwq，见上游 NOTICE）。

## 决策

把 orca-link 从 v1 插件形态移植为 v2 纯资产皮肤，落在
`packages/skins/skin-center/skins/orca-link/`，忠实还原上游运行时行为：由
`body[data-orca-scene]` 驱动的 hero/active 场景交叉淡化、带分状态帧率与质心对齐的
8x10 状态小人图集、侧栏 wordmark 与链路信号灯、标题打字机、输入框滚动意图动效与拖拽
收起、直角图标重绘、北京时区定价红绿灯、终端/AppFrame 过渡宽度锁、窗口恢复 tooltip
抑制、设置/cordis 浮层属性与 rail 搜索补全。`scripts/dsh-skin-migrate-v2.mjs` 提供
机械部分（CSS 抽取、哈希类名改为 `orca-ch-*`、五个实际使用图稿常量的资产提取、清单
草稿）；hooks 为在受信 SkinHooks 契约下的完整手工移植（无顶层副作用、状态收进单次
激活、单一幂等清理恢复所有 body 属性/内联样式/自有节点）。v1 的定制面板（角色/背景/
定价开关与「不那么二次元」时段）在 v2 没有设置面，故所有特性默认全开，隐藏态 CSS
锚点保留供将来设置面使用。许可与署名随皮肤目录分发（LICENSE/NOTICE），清单带
license/licenseUrl/noticeUrl/attribution；capture-previews 现把 orca 列入 hooks
动态场景清单；gallery 与 market dist 已重生成（创意工坊条目带 LICENSE/NOTICE 文件）。
本次移植暴露的 token-audit 解析器缺陷另记于独立 bug-fix note。

## 备选方案

只做静态层（token 重映射 + backgroundMedia + patches）被否决：ORCA LINK 的灵魂是
hooks 驱动的场景与角色状态，减配版等于另一个产品。以社区索引形式链接上游 GitHub
安装也被否决：用户要求皮肤真正进入我们的集合，而作者合作与 CC BY-NC-SA 条款均允许。

## 影响

移植后的 hooks.mjs 属于与 skin-center 同评审同发布的受信逃生舱代码，后续每次改动都走
同一评审路径；皮肤依赖 DSH DOM 锚点（`data-phase`、`data-conversation-scroll`、
`data-chat-flow`、composer seat、data-slot 侧栏），每轮 DSH shell 更新都需要回归——
maid-atelier 落地后又已修了 4 处兼容问题。CC BY-NC-SA 4.0 是持续性约束：皮肤不得售卖、
不得进入任何商业化打包，不得违反署名/非商业/相同方式共享条款；项目任何商业化使用前
必须移除或重新协商。

