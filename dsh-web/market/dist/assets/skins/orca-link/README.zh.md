# 虎鲸链路 (ORCA LINK)

[English](README.md) | 中文

虎鲸链路 —— 面向 DSH Web GUI 的轻量二次元科幻皮肤，作为皮肤中心包内的纯资产目录分发。经上游作者
([Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)) 许可移植，许可与署名链遵循本目录下的
[NOTICE](NOTICE) / [LICENSE](LICENSE)。

## 这是什么

- **纯资产目录**：`skin.json`（v2 清单）+ `skin.css`（token 重映射）+ `patches.css`（组件补丁）+
  `hooks.mjs`（受信逃生舱，与皮肤中心同评审同发布）+ `assets/`（场景立绘、状态小人图集）+
  `preview/`（亮/暗截图）。没有 package.json、没有构建步骤；皮肤中心包是唯一加载器。
- **场景**：亮/暗两套 hero/active 场景随 `body[data-orca-scene]` 标记交叉淡化——该标记由 hooks
  控制器从会话阶段（hero / settling / active）投射。立绘 URL 由 hooks 通过 body 级 CSS 变量写入，
  以相对皮肤资产基址解析（加载器把 CSS 内联进 `<style>`，相对 url() 会失效，故不走 patches.css）。
- **状态小人**：侧栏立绘舞台里的 8x10 图集角色，姿态行随链路状态切换（standby / syncing /
  working / approval / input / review / complete / fault / offline / ready），含按状态帧速率、
  单次序列与质心对齐补偿。
- **信号灯、定价指示灯、标题打字机、输入框动效与拖拽收起、图标重绘、终端宽度锁、窗口恢复
  tooltip 抑制、设置/链路面板浮层属性与 rail 搜索补全**：全部由上游 v1 插件移植，纯呈现层
  （无服务注入、无模型请求），卸载干净。
- **v2 契约说明**：上游的定制面板（角色/背景/定价开关与「不那么二次元」可见时段）在 v2
  没有设置面，因此所有特性默认全开；隐藏态的 CSS 锚点保留，供将来设置面使用。

## 许可

本皮肤为上游 ORCA LINK 皮肤与鲸鱼娘角色（上善 原作）的衍生作品，按
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 发布
（署名 — 非商业性使用 — 相同方式共享）；完整署名链见 [NOTICE](NOTICE)。禁止商业性使用。
