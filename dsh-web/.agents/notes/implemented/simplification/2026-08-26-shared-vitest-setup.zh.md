# Agent Note: 经 sync-shared 共享 vitest setup；web-settings 改为转发共享 config

Status: implemented

## Problem

测试环境的浏览器模块加载器（`vitest.setup.ts`，即在 vitest 下供 @deepseek-ai client 半包使用的 `window.__ModuleLoader__` 垫片）以逐字节相同的副本存在于 `shared/` 与三个包（web-settings、tool-describe-image、remote-web-ui），且没有任何漂移防护——加载器的修复必须手工重放到每个消费方。

## Decision

`shared/vitest.setup.ts` 现为 sync-shared 源文件，三个包根目录下的副本为生成物；漂移门禁（`test:scripts`）强制一致性。`packages/dsh-web-settings/vitest.config.ts` 原本与 `shared/vitest.config.ts` 逐字节重复，现改为转发共享 config——与共享 tsdown 构建预设相同的「引用而非复制」模式（其中相对路径按消费方包根目录解析）。

## Alternatives considered

审计摘要还声称有三份相同的 `vitest.config.ts`；实测只有 web-settings 与 shared 重复——tool-describe-image 需要 `jsx: automatic`，remote-web-ui 需要 `vite-tsconfig-paths`、node 环境与更宽的 include，两者刻意保留不动。把 vitest.config.ts 也作为生成副本同步的方案被否决：config 是包的入口而非 src 模块，且转发已覆盖唯一的真重复，无需引入新的复制机制。

## Consequences

加载器修复只需改一处并运行 `node scripts/sync-shared.mjs`；分叉会在 CI 失败。同步表增至 103 份副本。测试行为无变化——四个套件运行的 setup 代码与之前相同。

## Testing

`pnpm test:scripts`（同步表与漂移套件）、`pnpm docs:check`，以及 shared（74）、dsh-web-settings（66）、dsh-tool-describe-image（374）、dsh-remote-web-ui（397，先构建包以产出 lib/mobile.js）的完整测试套件——全部通过。
