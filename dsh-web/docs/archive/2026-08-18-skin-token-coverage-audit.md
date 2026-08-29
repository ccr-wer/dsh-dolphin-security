# Token 覆盖率审计报告 — 皮肤中心重设计 (#506)

> 一次性调研快照（2026-08-18，worktree /tmp/dsh-web-ui-skin-center，分支
> feat/skin-center-redesign）。统计口径：唯一 token 名以 `--dsw-[a-z0-9-]+` 精确
> 匹配；引用按 `var(--dsw-x` 全名精确统计；定义按 `--dsw-x:` 精确统计。

## 1. 官方 --dsw-* token 权威定义位置与总数

权威来源是官方 NPM 包 **@deepseek-ai/dsh-client-ui-theme@0.1.0-rc.7**：

| 文件 | 唯一定义数 | 定义出现次数 | 说明 |
| --- | ---: | ---: | --- |
| lib/styles/design-platform.css | 162 | 324 | 每 token 在 body（亮）与 body[data-ds-dark-theme]（暗）各一次 |
| lib/styles/gradient-shadow-text.css | 187 | 189 | 渐变/阴影/遮罩及全部 font-markdown、font-* 排版 token |
| lib/styles/base.css | 1 | 1 | --dsw-font-family |
| **合计（唯一 token）** | **350** | **514** | 三份文件互不重叠 |

- 本机运行时 apps/web 构建产物统计：351 = 主题包 350 + 组件局部的 --dsw-hovercard-bg。
- 全部 @deepseek-ai/* 官方包中只有 dsh-client-ui-theme 定义 token；其余包合计使用 101 个唯一 token。
- 官方包自身 2 个「用了却没定义」：--dsw-alias-line-secondary、--dsw-alias-separator-primary（conversation 客户端内联 CSS 引用）。
- **官方 token 实际总数 = 350**；早前「约 564」的说法与实际不符（514 是含亮暗双份的定义出现次数）。

## 2. Token 分组（350 个唯一 token）

| 组 | 数量 | 细分 |
| --- | ---: | --- |
| font | 181 | font-markdown: 102；font-xxxs/xxs/xs/s/base 各 12；font-xl/m/l 各 6；font-family: 1 |
| alias | 78 | alias-button: 15；alias-bg: 13；alias-state: 11；alias-label: 9；alias-markdown: 8；alias-border: 7；alias-interactive: 5；alias-scrollbar: 4；alias-brand: 4；alias-tooltip/toast 各 1 |
| static | 73 | static-neutral: 35；static-blue: 12；static-deepseek: 11；static-red: 6；static-amber: 5；static-green: 4 |
| specific | 11 | specific-sidebar: 4；specific-bubble: 2；specific-tip/selector/menu/login/input 各 1 |
| shadow | 4 | shadow-lv1: 2、lv2: 1、lv3: 1 |
| linear | 2 | linear-gradient-think、linear-think-select |
| mask | 1 | mask-blur |

三层语义：static-* 色阶原料；alias-* 语义层（换肤主战场）；font-* 大头是 markdown/shiki 排版细粒度 token。

## 3. 功能插件 + 皮肤中心的 token 引用

合计 744 次 var(--dsw-*) 引用，52 个唯一 token。

| 包 | var() 引用次数 |
| --- | ---: |
| dsh-task-board | 159 |
| dsh-ssh | 116 |
| dsh-remote-web-ui | 116 |
| dsh-git-graph | 94 |
| dsh-community-plugins | 87 |
| skin-center | 82 |
| dsh-aionui-panel | 45 |
| dsh-pet | 43 |
| dsh-web-ui-settings | 2 |

插件引用的 52 个 token 中被官方定义缺失的（!）见第 5a 节。dsh-git-graph 在自己 module.css 局部类里重绑定了 9 个 alias token（组件作用域局部覆盖，合理用法）。

## 4. 11 个皮肤的 token 重映射与使用

| 皮肤 | 重映射 token 数（唯一） | 重映射出现次数 | var() 引用次数 | var() 唯一 token |
| --- | ---: | ---: | ---: | ---: |
| blue-fantasy | 161 | 334 | 13 | 8 |
| dragon-heir | 161 | 334 | 10 | 6 |
| harbor | 80 | 160 | 2 | 1 |
| maid-atelier | 39 | 252 | 6 | 4 |
| matrix | 156 | 156 | 0 | 0 |
| miku | 162 | 331 | 17 | 7 |
| minecraft | 145 | 145 | 11 | 4 |
| trading | 154 | 307 | 11 | 8 |
| whale-mom | 167 | 269 | 107 | 33 |
| whale-song | 161 | 334 | 14 | 8 |
| xp | 154 | 319 | 11 | 4 |
| 并集 | 181（官方存在 162，不存在 19） | 2541 | 202 | 46 |

## 5. 交叉分析

### 5a. 幻觉 token（用了/定义了但官方不存在）

皮肤定义的 19 个非官方 token 三类：

1. 皮肤中心扩展钩子（有意，但占用官方命名空间）：--dsw-skin-scrim、--dsw-skin-sidebar-alpha、--dsw-skin-sidebar-rgb、--dsw-skin-text-mid、--dsw-skin-text-strong、--dsw-skin-bubble-v2/v3/v4（whale-mom）。
2. 替官方打补丁的影子 alias：--dsw-alias-tooltip-fg（8 皮肤定义）；--dsw-alias-line-secondary、--dsw-alias-separator-primary（官方 conversation 自己也在用）；--dsw-alias-label-quaternary、--dsw-alias-state-business-subtle、--dsw-alias-state-warning-primary（无人消费）。
3. 死定义：--dsw-static-neutral-75/750/875/950（matrix）、--dsw-static-neutral-bluish-250（4 皮肤），零消费，应清理。

插件引用的 6 个非官方 token（更严重，插件纯消费）：

| token | 引用 | 分布 | fallback | 严重度 |
| --- | ---: | --- | --- | --- |
| --dsw-alias-label-error | 25 | task-board / pet / remote-web-ui / community-plugins / aionui-panel | 无 | 高：错误文本红色语义完全丢失，真 bug |
| --dsw-alias-separator-primary | 4 | task-board / ssh | 无 | 高 |
| --dsw-alias-link-primary | 3 | community-plugins | 有 | 低 |
| --dsw-alias-text-danger | 1 | remote-web-ui | 有（语义错误） | 中 |
| --dsw-font-mono | 1 | remote-web-ui | 有 | 低 |
| --dsw-alias-state-danger | 1 | skin-center | 有（#c53030 硬编码，破坏换肤） | 中 |

### 5b. 插件大量引用但皮肤很少重映射（换肤漏覆盖风险）

- 高：--dsw-alias-label-error（25 引用 / 0 皮肤覆盖）；--dsw-alias-separator-primary（4 / 2）。
- 中：shadow 组（--dsw-shadow-lv3 5 引用 0 覆盖；lv1/lv2 几乎无覆盖）；--dsw-mask-blur（1 / 0）。
- 低：--dsw-font-family（2 / 5）；--dsw-font-markdown-code-block-small（2 / 0）。

好消息：78 个官方 alias token 中 77 个被 >=1 皮肤重映射；28 个被全部 11 皮肤重映射；插件引用 Top-20 除幻觉项外全部被 10-11 皮肤覆盖。

### 5c. L1 稳定 token 白名单 v1 建议（84 个 = 81 现存官方 + 3 待新增）

选入标准：(i) 被 >=8 皮肤重映射，或 (ii) 被插件/skin-center 消费，或 (iii) 5b 覆盖缺口。不含 static 原料与 181 个 font 细粒度 token（仅保留 font-family 与 font-markdown-code-block-small）。

- 文本/品牌（10）：label-primary、label-primary-foreground、label-primary-inverted、label-primary-dimmed、label-secondary、label-tertiary、label-dimmed、label-caption、brand-primary、brand-text（均 --dsw-alias- 前缀，下同从略）
- 背景/分层/遮罩（10）：bg-base、bg-layer-1/2/3、bg-overlay、bg-module-platform、bg-mask-1/2、bg-skeleton、--dsw-mask-blur
- 边框/分隔（5）：border-l1/l2/l3/l4、border-l2-darkmode-thin
- 交互态（5）：interactive-bg-hover、interactive-bg-hover-solid、interactive-bg-hover-danger、interactive-bg-hover-accent、interactive-bg-active
- 状态色（9 + 3 待新增）：state-error-primary/secondary、state-warn-primary/secondary、state-success-primary/secondary/tertiary、state-business-primary/tertiary；待新增 label-error、separator-primary、line-secondary
- 按钮（12）：button-primary-fill/hover/dimmed、button-info-fill/hover、button-tool-bar-fill、button-contrast-fill、button-floating-fill/hover、button-elevated-fill、button-ghost-active-fill/hover
- markdown 语义（8）：markdown-code-block、markdown-code-block-banner、markdown-inline-code、markdown-tag、markdown-citation、markdown-placeholder、--dsw-font-markdown-code-block-small、--dsw-font-family
- 浮层/反馈（6 + 1 待新增）：toast-bg、tooltip-bg、待新增 tooltip-fg、--dsw-shadow-lv1/lv1-blur/lv2/lv3
- 滚动条（4）：scrollbar-bg-l1/l2、scrollbar-hover-l1/l2
- 官方壳层 specific（11）：specific-sidebar-fill、specific-sidebar-nav-item-hover/active/active-accent、specific-input-major、specific-login-input、specific-menu、specific-selector、specific-tip、specific-bubble、specific-bubble-highlight

## 6. 实施期处置建议

1. P0 — 官方新增 --dsw-alias-label-error：仓内 5 插件 25 处无 fallback 引用，线上即渲染错误；仓内过渡方案批量改 var(--dsw-alias-state-error-primary)。
2. P0 — 官方新增 --dsw-alias-separator-primary 与 --dsw-alias-line-secondary（官方 conversation 自身引用，上游 bug）。
3. P1 — 官方新增 --dsw-alias-tooltip-fg（8 皮肤私自定义，事实标准，收编进 alias 层）。
4. P1 — 统一危险/错误语义：state-danger / text-danger 与 state-error-primary 收敛，去硬编码 fallback。
5. P2 — 官方补 --dsw-alias-link-primary、--dsw-font-mono。
6. P2 — static 死定义清理（matrix / 四皮肤的私有色阶，零消费直接删）。
7. 仓内自治：皮肤中心扩展钩子与 whale-mom 内部变量（12 个 --dsw-skin-*）改非官方前缀（如 --dsh-skin-*）；shadow 组纳入皮肤脚手架默认重映射占位。
8. 认知修正：官方 token 总数 350，「564」说法更正。
