# Agent Note: dsh-perf client export 修复

Status: implemented

## 问题

`dsh --profile web` 在 Web UI 启动前报错 `client-modules: 1 client package failed to compose`：`@linxin666/dsh-perf` 声明了 `dsh.client.platform: "web"`，但其 `package.json` 没有导出 `./client`。官方 client-modules loader 通过 `exports["./client"]` 解析浏览器半区，因此缺失该子路径会被当成插件组合错误，即使 `lib/client.js` 已经存在。

## 决策

在 `packages/dsh-perf/package.json` 补充标准客户端子路径：

- `"./client"` 的类型映射到 `./lib/types/client/index.d.ts`，运行时映射到 `./lib/client.js`。
- 保持现有 `dsh.client` 声明不变；浏览器 HUD 仍然是包的一部分。
- profile 通过 pnpm link 依赖当前 checkout，因此不需要改 profile 或依赖。

## 备选方案

- **删除 `dsh.client` 声明**：拒绝。这会禁用 HUD，让声明的 `dsh-perf` 功能静默退化为纯 host 插件，而不是修复包契约。
- **只写字符串导出**：拒绝。仓库内同族包惯例是带 `types` 的条件对象，loader 直接接受该形式。

## 影响

profile 插件树可以正常组合。启动清单会包含 `@linxin666/dsh-perf`，客户端 bundle 能从预期 URL 提供，用户无需改 profile 即可重新运行 `dsh web`。现有包契约与其他带 client 半区的 dsh-web 包保持一致。

## 验证

- `pnpm --filter @linxin666/dsh-perf build`：host 与 client bundle 均构建成功。
- `pnpm --filter @linxin666/dsh-perf typecheck`：通过。
- `require.resolve("@linxin666/dsh-perf/client")` 解析到 `packages/dsh-perf/lib/client.js`。
- `dsh --profile web --no-open --port 0` 可启动，HTTP 200，且 `/plugins/@linxin666/dsh-perf/client.js` 返回 HTTP 200；临时验证服务已停止。
