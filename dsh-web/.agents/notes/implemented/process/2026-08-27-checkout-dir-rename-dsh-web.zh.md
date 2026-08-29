# Agent Note: 本机检出目录更名为 dsh-web

Status: implemented

## Problem

开发检出一直放在 `/Users/zcl/code/dsh-web-ui`，而远程仓库、文档与技能早已统一为 `zhu1090093659/dsh-web`（见[产品更名](../architecture/2026-08-24-product-rename-dsh-web.zh.md)）。过期的目录名让本机运行手册、测试夹具和发版命令不断偏离真实路径。

单纯 `mv` 并不够：引用伸到了仓库之外。DSH profile 通过软链接挂载本仓的包（`~/.dsh/profiles/**` 下数十条链接都爬回旧路径）；一个外部链接 worktree 用绝对路径登记了本仓库的 gitdir；仓库内受跟踪文本也内嵌旧绝对路径。不做准备直接搬走后，运行中的 DSH 实例在下一次懒加载或重启时插件解析会失败，外部 worktree 直接报废。

## Decision

- 检出现在位于 `/Users/zcl/code/dsh-web`。临时兼容软链接保障了搬迁期间的解析连续性；后续清理已把所有 DSH profile 依赖（profile 清单及其 pnpm-lock、pnpm `.package-map.json` 副本、全部 79 条 profile 包链接）重指向新根并摘除软链接，`/Users/zcl/code/dsh-web-ui` 不复存在。
- 外部 worktree `/Users/zcl/remote-e2e/pr-970` 的 `.git` 指针已改写到新位置，不再依赖兼容软链接；`/private/tmp` 下遗留的临时推送 worktree 已从注册表清理。
- 同一变更内更新受跟踪文本：发版技能运行手册的路径与其 `cd`、dsh-pet 安装示例注释、以及代表本机检出路径的 plugin-manager 迁移夹具。
- 冻结的运行时标识符保持不动：`@linxin666/dsh-web-ui-all` npm 包名与遥测/产品字符串仍按[产品更名](../architecture/2026-08-24-product-rename-dsh-web.zh.md)划定的边界处理，不被本次搬迁波及。
- 顺带移除了指向 JAVA-LW/dsh-web-ui 的本地遗留远程 `java-lw`；`origin` 是唯一远程。

## Testing

- 搬迁完成后立即验证：`git status` 在 `dev` 上干净、两个 stash 完好、worktree 列表健康、3080 端口运行中的 GUI HTTP 探测返回 200。
- 清理完成后：活跃 profile 配置中不再有任何旧路径引用；此前全部有效链接仍然解析成功（2821 条链接有效性基线，摘链前后零回归）；运行依赖（`dsh-perf`、`dsh-web-all`、`dsh-liangshen`）直接从新根解析。
- `@linxin666/dsh-client-ui-plugin-manager` 的 `vitest run tests/gateway-jobs.spec.ts tests/update-route.spec.ts` 通过。

## Alternatives considered

不留兼容软链接的一次性彻底迁移：搬迁后立刻改写每个 profile 的依赖声明并逐个重装受影响的 DSH profile。本次未采纳：消费方横跨多个 profile 且软链来源混杂，GUI 正在运行时逐步重建存在插件加载中断风险；软链接能以零运行时暴露获得同样的解析结果，并自带明确的摘除条件。

让目录永远叫 `dsh-web-ui`：已否决——名称错位会让技能、夹具和文档持续累积错误路径漂移，与产品更名已记录的方向相悖。

## Consequences

- 搬迁不影响 Git 历史、分支、tag 与 stash；没有提交被改写。
- 兼容软链接的过渡使命已完成：各 profile 直接指向 `/Users/zcl/code/dsh-web`，后续工作无需再感知旧路径。以下惰性残留刻意保持不动：任务板历史 prompt、`.bak*` 快照、按旧 cwd 记录的会话存储、某份已安装 `dsh-tool-describe-image` 副本内的构建期注释，以及搬迁前就已悬空的旧皮肤链接。
- 新会话应绑定到 `/Users/zcl/code/dsh-web`；按旧 cwd 记录的会话存储是历史数据，无需迁移。
