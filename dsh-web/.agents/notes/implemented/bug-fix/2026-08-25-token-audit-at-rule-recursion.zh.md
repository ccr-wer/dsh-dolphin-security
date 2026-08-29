# Agent Note: token-audit at-rule 递归边界

Status: implemented

## 问题

`auditTokenContract`（skin-center css-safety/token-audit.ts）通过
`parseDefinitions` 扫描自定义属性定义，其 at-rule 分支以
`visit(open + 1)` 递归且没有块边界。嵌套扫描因此会对每个 at-rule 重扫样式表
剩余的全部块；面对嵌套 at-rule 链（`@media` > `@supports` > `@container` >
`@keyframes`——v1 CSS-modules 包经过迁移后保留的形态），遍历指数级退化：
审计迁移后的 orca-link patches.css 约需 126 秒，`dsh-skin validate` 与各检查
门禁对任何此类皮肤都会挂死。

## 决策

把 at-rule 递归收口到自身右花括号：`visit(start, limit, ...)`，`limit` 以
外层 close 为上限（越界的 close 视为未闭合，剩余部分交给外层扫描）。嵌套 token
提取保持可用——内层块仍会被遍历——总扫描恢复线性。回归覆盖加在 css-safety.spec.ts：
嵌套 @media/@supports/@keyframes 链在限时内完成、嵌套的 `button-primary-fill`
仍被识别（无缺失锚点警告）、且不出现对比度警告。

## 备选方案

改为扁平化生成的 CSS（lightningcss 仍输出嵌套 @media 组合，病态输入仍在）与
不改（门禁对任何含迁移嵌套 at-rule 的皮肤不可用——社区未来移植的潜伏 CI 挂死）
均被否决。

## 影响

审计保持 warning-only 且行为兼容，仅遍历成本变化。今后任何深嵌套 at-rule 的
样式表都能在限时内完成；回归测试防止边界被悄悄退化。

