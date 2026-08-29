# Agent Note: 设置桥接白名单收录创意工坊与皮肤中心命名空间

状态：已实现 (implemented)

## 问题背景

在 `packages/dsh-web-settings/src/allowlist.ts` 中，内置家族白名单 `FAMILY_NAMESPACES` 与别名表 `NAMESPACE_ALIASES` 遗漏了 `dsh-web-ui-market`（创意工坊卡片命名空间）以及皮肤中心的主题色板（`skin-custom-theme`）和壁纸（`skin-wallpaper`）命名空间。官方 host-apiproxy 硬编码了设置白名单并对未列出的命名空间返回 `settings-not-exposed`，第三方命名空间必须依赖 `dsh-web-settings` 的家族兜底白名单暴露。由于白名单缺失，在未手动配置 `web_settings_namespaces` 的默认安装环境下，打开 设置 → 创意工坊 时整卡报错显示「该设置段未暴露（宿主命名空间缺失）」，无法使用。

## 技术决策

1. 在 `packages/dsh-web-settings/src/allowlist.ts` 中，将 `dsh-web-ui-market`、`skin-custom-theme`、`skin-wallpaper` 加入 `FAMILY_NAMESPACES` 默认白名单数组。
2. 在 `NAMESPACE_ALIASES` 中补充 `dsh-market`、`dsh-client-ui-market`、`dsh-web-ui-market`、`market`、`skin-custom-theme` 与 `skin-wallpaper` 的别名映射。
3. 在 `allowlist.spec.ts` 中补充针对创意工坊与皮肤命名空间别名解析与默认白名单组合的单元测试。

## 影响与收益

在干净默认安装环境下，设置中的「创意工坊」分区及皮肤定制色板/壁纸设置可正常暴露与配置，不再出现「宿主命名空间缺失」阻断问题。

## 验证结论

`pnpm --filter @linxin666/dsh-client-ui-web-ui-settings test`（66 项测试通过）、全仓 `pnpm typecheck`、`pnpm test`、`pnpm test:scripts` 与 `pnpm docs:check` 全绿。
