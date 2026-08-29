# Agent Note: Doctor 客户端默认 API 前缀

Status: implemented

## Problem

dsh-doctor 设置卡片（「宿主状态」面板）在所有机器上永久显示「Doctor 离线 / endpoint unavailable」，与宿主真实状态无关。宿主半区其实是健康的——`GET /api/doctor/status` 返回 200 JSON、supervisor 快照为 armed——但浏览器半区从未到达该端点：`DoctorApi` 的 `base` 默认值为 `''`，请求 URL 拼成 `this.base + '/' + endpoint` = `/status`，完全绕过了 `/api/doctor` 前缀。Web 服务对 `/status` 的 404 被归类为 `not-available`，UI 渲染为「endpoint unavailable」。`DOCTOR_API_BASE` 常量虽已定义但从未被引用，且所有测试都显式注入 base，空默认值从未被覆盖到。

## Decision

`DoctorApi` 现在把 `base` 默认值改为 `DOCTOR_API_BASE`（`/api/doctor`），位于 `packages/dsh-doctor/src/client/doctor-api.ts`；显式 `base` 覆写保留给测试使用。`packages/dsh-doctor/tests/client-doctor-api.spec.ts` 新增回归测试：不传 base 构造 `DoctorApi`，断言 fetch URL 为 `/api/doctor/status`。

## Alternatives considered

- **在各构造点传 `DOCTOR_API_BASE`**（`src/client/index.ts`、controller 默认值）：能修同样的症状，但保留了隐患——下一个不带参数的 `new DoctorApi()` 还会悄悄坏掉。把默认值放在构造函数里，让正确路径成为零成本路径。
- **从 `window.location` 或配置服务推导 base**：该路由族是宿主半区拥有的固定同源 loopback API，没有可配置项，增加间接层没有收益。

## Consequences

恢复控制台现在会请求真实的宿主端点；「endpoint unavailable」重新具有意义（宿主半区未启用、未挂载或返回非 JSON 的 SPA 回退页），不再是永久性误报。修复需要重建 client bundle 才能到达浏览器；不需要重启宿主或改动 profile。

## Testing

`pnpm --filter @linxin666/dsh-doctor typecheck`、`test`（367 通过）、`build` 全部通过；实测 `GET http://127.0.0.1:3080/api/doctor/status` 返回 200 JSON，而 `/status` 返回 404。
