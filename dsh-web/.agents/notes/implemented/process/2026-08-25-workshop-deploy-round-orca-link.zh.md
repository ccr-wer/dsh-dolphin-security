# Agent Note: 工坊部署轮次 — orca-link 上架

Status: implemented

## 问题

orca-link v2 移植需要进入线上创意工坊（https://dsh-market.com）。本轮部署是后续贡献者
在内容变更（皮肤/宠物/插件）需要上线时的可复用流程记录：跑了什么、跳过了什么、如何验证。

## 决策

从本地检出手动部署工坊（本轮提交未推送，CI 路径未触发）：

1. 重新生成内容：`node scripts/market-build`（用 `pnpm market:check` 验证；绝不在 CI 重建）；
2. 把重生成的 `market/dist` 随变更提交；
3. 部署：`node scripts/deploy-market --skip-redirect`——gallery.dsh-market.com 的 301
   规则已存在（公开验证：`curl -sI https://gallery.dsh-market.com` → 301），且重定向步骤需要
   `CLOUDFLARE_API_TOKEN` 与账号 id，本地 shell 没有；wrangler 步骤（D1 迁移 + Worker +
   静态资产）改用已有 OAuth 登录完成。
4. 验证：`curl https://dsh-market.com/manifest/skins.json` 出现新 id（21 款皮肤；orca-link
   带 LICENSE/NOTICE 文件），商店页面卡片含作者/版本/标签语。

节奏规则：后续任何内容变更都走 market-build → 提交 → deploy-market 同一循环；CI 备选路径
（推 dev 自动部署）见
[2026-08-25-workshop-deploys-from-dev.md](../../implemented/process/2026-08-25-workshop-deploys-from-dev.md)。

## 备选方案

推 dev 触发 CI 部署而非手动执行，本轮被否决：用 `--skip-redirect` 有意识地手动部署更容易
控制与回退，且手动路径明确保留了验证步骤。

## 影响

线上商店现已展示 orca-link（可见卡片），其一键安装带有官方市场 provenance；后续轮次要记住
market/dist 是提交产物（market:check 对漂移失败），deploy-market 可安全重跑（D1 迁移幂等、
静态资产按哈希增量上传）。
