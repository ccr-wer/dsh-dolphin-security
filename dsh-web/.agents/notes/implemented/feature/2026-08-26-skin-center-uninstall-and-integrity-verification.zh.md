# Agent Note: 皮肤中心已安装皮肤卸载与完整性校验

Status: implemented

## Problem

此前用户通过创意工坊或手动目录安装至 `$DSH_HOME/skins/<id>/` 的皮肤，在前端皮肤中心 GUI 中缺少卸载和文件完整性排查手段：
1. **无界面内卸载**：移除已安装皮肤需要用户手动打开本地文件系统并删除 `$DSH_HOME/skins/<id>/` 目录。若卸载了当前正处于 active 状态的皮肤，下次页面加载可能遇到皮肤缺失报错或状态残留。
2. **Provenance 篡改与安全沙箱排查困难**：用户目录皮肤若包含 JavaScript Hooks（`hooks.mjs`）或样式资源，运行时会执行严格的 Fail-Closed 安全审计（基于 `dsh-market.provenance.json` 的 SHA256 哈希比对，或比对历史审查清单 `REVIEWED_SKIN_HOOKS`）。当用户本地文件被意外修改或损坏时，接口会拦截并返回 403 `hooks-require-review`，但在前端无法一键排查所有皮肤的健康状态。

## Decision

- **完整性校验与自动修复核心与 API** (`packages/skins/skin-center/src/provenance.ts`, `skin-repo.ts`, `routes-v2.ts`)：
  - 新增 `verifySkinIntegrity` 与 `verifyAllSkinsIntegrity`，递归扫描目录中所有已安装皮肤的文件哈希是否与 `dsh-market.provenance.json` 清单一致。
  - 新增 `repairSkinFromMarket`、`repairSkin` 与 `verifyAndRepairAllSkins`：当验证发现文件篡改（`tampered`）、文件缺失（`missing-files`）或 Hooks 校验失败时，自动从官方创意工坊源（`https://dsh-market.com`）或本地源码镜像拉取正版正本文件并覆写，重新生成 `dsh-market.provenance.json` 并刷新目录缓存。
  - 挂载 `POST /api/skin-center/v2/verify`（支持 `autoRepair: true` 自动修复并返回 `repaired` 列表）及 `POST /api/skin-center/v2/skins/:id/repair`，受同源安全门（`requireSameOrigin`）防护。
- **用户皮肤卸载核心与 API** (`packages/skins/skin-center/src/skin-repo.ts`, `routes-v2.ts`)：
  - 新增 `uninstallUserSkin(id, opts)`：校验安全 ID 格式防路径逃逸，调用 `rmSync` 安全删除 `$DSH_HOME/skins/<id>` 并同步清理目录缓存。随 npm 包发布的内置皮肤（`origin === 'builtin'`）受保护不可卸载（返回 400 `cannot-uninstall-builtin`）。
  - 挂载 `POST /api/skin-center/v2/skins/:id/uninstall`。若卸载的皮肤为当前激活皮肤，后端自动将 active 状态重置为官方默认（`null`）。
- **GUI 交互与状态反馈** (`packages/skins/skin-center/src/client/SkinCenter.tsx`, `skin-center.module.css`, `locales.ts`)：
  - 顶部工具栏：在主题预览按钮旁新增「验证完整性」按钮，点击发起全量校验与自动修复；修复成功时顶部展示绿色成功统计条（如「已自动修复 N 款皮肤的完整性异常」），激活皮肤被修复时自动重新联动加载最新脚本与视觉效果。
  - 皮肤卡片：对用户目录皮肤（`entry.origin === 'user'`）展示「卸载」危险操作按钮，并具备防误触的两段式确认（「确定」与「取消」）。若正在试穿或激活该皮肤，卸载前自动先平滑切回官方默认。
  - 完整性状态徽章：卡片上若存在校验结果，展示对应状态徽章（`badgeSuccess` / `badgeWarning` / `badgeDanger`）以及具体文件异常提示。

## Alternatives Considered

- *纯前端删除*：不可行，浏览器沙箱无法直接操作操作系统文件，必须经过后端 API。
- *一键直接删除*：放弃单次点击即删除，采用两段式确认交互以防止用户误操作丢失本地定制。

## Consequences

- 内置皮肤（`blue-fantasy`）保持只读不可卸载。
- 卸载后同步清理内存目录缓存，前端调用 `refreshCatalog()` 即可无刷新即时响应，无需强制重启宿主进程。
- 所有新增接口严格受 CSRF 同源门（`requireSameOrigin`）保护。

## Verification

- `packages/skins/skin-center/tests/routes-v2.spec.ts` 与 `tests/skin-repo.spec.ts` 补充了全量测试用例（包括卸载、激活回退、防逃逸、内置防护、完整性校验、篡改检测、跨域拦截）。
- 全工作区测试（`pnpm test`）及所有检查（`pnpm typecheck`, `pnpm skin-center:check`, `pnpm docs:check`, `pnpm market:check`）全部通过。
