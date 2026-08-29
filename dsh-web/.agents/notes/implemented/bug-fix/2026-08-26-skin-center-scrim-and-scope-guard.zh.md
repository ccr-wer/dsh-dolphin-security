# Agent Note: 皮肤中心遮挡变量管辖与设置作用域防护

状态：已实现 (implemented)

## 问题背景

1. (#1178) `skin-controller.ts` 的 `setBackgroundLayer` 在空绘制与有图分支硬编码了 `style.setProperty('--dsh-skin-scrim', '0')` 与 `'1'`，直接冲掉了用户在 `BackgroundController` 中设置的自定义透明遮挡度 `--dsw-skin-scrim`。在切皮肤或壁纸抑制状态翻转时，用户设置的遮挡度被强制改写为 0 或 1，造成 DOM 与设置滑杆失步。
2. (#1184) 当其他插件广播 `settings/document-updated`（如切换模型修改 `agent-default-model`）时，`background-scope.ts` 的 `reconcileSkinBackgroundScope` 需具备严格前置防护，杜绝任何未修改的空用户层被转为 patch 覆盖写入 `skin-center-active.json`。

## 技术决策

1. 在 `packages/skins/skin-center/src/client/runtime/skin-controller.ts` 中，移除 `setBackgroundLayer` 对遮挡变量的强制赋值与重置，将 `--dsw-skin-scrim` 的唯一管辖权归还给 `BackgroundController`；
2. 在 `packages/skins/skin-center/src/core/background-scope.ts` 中，对 `reconcileSkinBackgroundScope` 增加对空用户层（`currentUserJson === ''`）的显式拒绝保护，确保无关 settings 变动绝不向 v2 写入补丁；
3. 在 `skin-runtime.spec.ts` 与 `background-scope.spec.ts` 中完善了回归测试。

## 影响与收益

用户在皮肤中心配置的背景遮挡透明度在皮肤切换、壁纸挂载/抑制状态变动及全仓设置更新下始终稳定保持，不再发生被重置或失步的问题。

## 验证结论

`pnpm --filter @linxin666/dsh-client-ui-skin-center test`（560 项测试通过）、全仓 `pnpm typecheck` 与 `pnpm test` 全绿。
