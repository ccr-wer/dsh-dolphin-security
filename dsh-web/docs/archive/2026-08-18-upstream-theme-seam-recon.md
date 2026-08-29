# 上游 minimal theme-seam 调研快照（issue #506，2026-08-18）

> 一次性调研快照归档。对象：deepseek-ai/deepseek-harness @ master（浅克隆 HEAD 99f6f02fe，dsh 0.1.0-rc.7），只读。

## 0. 先决发现（先于一切方案）

上游 CONTRIBUTING.md:9：**暂不接受外部 PR**（"We are sorry that we cannot accept external pull requests at the moment."）。鼓励的参与方式：GitHub Discussions 报 issue/bug、做社区插件（dsh-plugin topic）、写博客。
→ 策略：先走 Discussion/Issue 前置沟通，获维护者明确邀请后再提 PR。

## 1. 缝 a：L1 token 契约

- token 全部定义在 packages/client/ui-theme（@deepseek-ai/dsh-client-ui-theme，publishConfig public）：
  design-platform.css 324 定义行、gradient-shadow-text.css 189 行、base.css:6-14 一个；合计 514 定义行 / 约 380 唯一名（上游仓库实测口径；npm 包侧审计口径为 350，差异来自统计范围，详见 token 审计快照）。
- token 经 apps/web 的 base.css @import 打进构建产物（web/src/base.css:5-9）；运行时覆盖层由 ui-layout ThemePresenter 写 body 内联变量（theme-presenter.ts:43-48）。
- 亮暗双套：design-platform.css:4 body {亮}、:80 body[data-ds-dark-theme] {暗}。

### 1.3 已存在的主题机制（比预想完善）

ui-theme/src/client/index.ts 实现完整 ThemeRuntime（ctx.theme 客户端服务）：

- ThemeDefinition { id, colorScheme, tokens }（:61-71），内置 light/dark（:118-121）；
- register(definition) 注册第三方主题（:228 起），重复 id 抛错，dispose 自动回退默认主题；
- overrideTokens(source, tokens) 叠加 token 覆盖层（:276-290），按 seq stacking、可撤销；运行时校验强制每 token 提供 { light, dark } 双值（validateOverrides :333-358）；
- setTheme/getTheme + 'theme/change' 事件（:103-115）；
- BUILTIN_INSPECT_TOKENS（:123-136）已枚举 13 个核心语义 token（bg-base、bg-layer-1/2、bg-overlay、border-l1/l2、brand-primary、label-primary/secondary、state-error/success/warn-primary、sidebar-fill），exportInspectTokens()（:201）导出。

README 自承边界："Third-party themes are an extension point, not a product … no validation exists that an override set is complete."
docs/web-styling.md:5,9,16：token 值所有权在 ui-theme；功能组件只能用 --dsw-alias-* 语义 token；但无稳定 API 式清单文档。

### 1.4 最小改动方案（缝 a）

把 BUILTIN_INSPECT_TOKENS 核心子集（可补圆角/阴影）在 docs/web-styling.md + ui-theme README 双语对中文档化为 theming surface，零代码改动。

## 2. 缝 b：tapIndex 注入链

- host/webserver/src/index.ts:139 tapIndex(transform): () => void；:259 applyIndexTaps 按注册顺序执行；调用时机为每次 index 响应（frontend-static/src/index.ts:96-97）。
- 公开 API 多重承诺：JSDoc 完整无 experimental 标注；类型随 npm 发布；进 cordis API 目录（tool-cordis/src/api-catalog.ts:2086-2097，gen-cordis-api 生成 + CI 新鲜度门禁）；进官方文档（docs/subsystems/web-server.md:96,:45）；有官方测试（webserver.spec.ts:120-127）。
- 官方 FOUC 先例：ui-theme/src/index.ts:37-42 用 tapIndex 注入 boot-theme（boot-theme.ts:31-39 在 body 开标签后插同步内联脚本，首屏前写 colorScheme 与 body[data-ds-dark-theme]）；client/modules/src/index.ts:246 用 tapIndex 注入 window.__DSH_BOOT__。
- 结论：第三方插件用 tapIndex 做首屏注入已是支持用法，无需新机制；唯一缺口是面向第三方的使用指引散文。

## 3. 缝 c：html/body 作用域属性缝

- apps/web/index.html（14 行）html 上无 data 属性；主题属性在 body（boot-theme.ts:19 toggleAttribute('data-ds-dark-theme')），token 色板选择器相应挂 body（design-platform.css:80）。
- 第三方客户端代码最早执行时机晚于首屏，首屏前注入只能走 tapIndex。
- 结论：无需新缝；tapIndex 满足全部需求。官方惯例是 body 属性，皮肤中心用 html[data-dsh-skin] 无技术冲突，CSS 等价；若维护者要求统一可让步为 body。

## 4. 上游贡献规范清单

1. 先决：暂不接受外部 PR；blank issues 关闭，feature.md 模板（中文行动句标题、外露正文 ≤50、details 内验收条件）。
2. PR 模板：Fixes #NN / Related to #NN；非 Draft 人类 PR 至少引用一个同仓库 Issue；同步 Priority。
3. Conventional Commits 风格（无 commitlint 实证）；无 DCO/CLA。
4. lefthook pre-commit：翻译配对、oxlint --fix、THIRD_PARTY_NOTICES 重生成等；pre-push pnpm typecheck。
5. CI：check:ci:static/coverage/consumers（playwright）、node 矩阵、pytest、windows/wine 等。
6. 文档纪律：双语配对 + i18n.yaml（lefthook/doc-sync 强制）；一段一物理行；生成区禁手改；每个非琐碎改动至少一条 .agents/notes/ Agent Note；package README 含 Model Experience/Known Limitations 固定节。

## 5. 风险预判

1. 「暂不接受外部 PR」是最大硬阻塞 → 先 Discussion。
2. rc 阶段稳定性承诺抵触 → 措辞降级为 "documented extension point, subject to change until 1.0"。
3. 文档归属层级冲突（一个事实一个家；生成区禁手改）。
4. Agent Note 强制易遗漏。5. 双语配对成本。6. 范围蔓延（13 token → 完整清单/运行时校验）。7. html vs body 属性分歧（可让步）。

## 附：调研局限

- npm 各包实际发布 .d.ts 未下载验证（以源码 exports 推断）；ctx.theme 的第三方可见性未验证；未执行上游构建，CI 清单来自 yml 静态阅读。
