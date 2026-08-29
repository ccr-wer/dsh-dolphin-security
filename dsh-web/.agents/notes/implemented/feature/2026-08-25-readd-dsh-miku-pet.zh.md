# Agent Note: 附完整评审证据重新收录 dsh-miku-pet

Status: implemented

## Problem

PR #1031 在仓库移除该包后重新引入了 dsh-miku-pet（见 [Remove dsh-miku-pet](../../../simplification/2026-08-24-remove-dsh-miku-pet.md)）。移除时清理了独立包、聚合行、社区索引条目与 Workshop 元数据；本次重新提交为仓库内包并注册进 dsh-web-all 聚合（19 rows, 18 deps）。维护者评审要求三项通过条件：/miku-pet/config 写接口的同源守卫与路由级测试、初音ミク角色权利边界文档、真实 DSH GUI 证据。

## Decision

本包已接受并合并（squash，ef0cbe88），补齐内容如下：

- 宿主写守卫：/miku-pet/config 的 PUT/DELETE 前置共享 loopback fence（packages/dsh-miku-pet/src/loopback.ts 由 shared/host/loopback.ts 同步；sync-shared.mjs MANIFEST 与副本计数测试同步更新）。路由级测试 tests/config-fence.spec.ts 证明跨站/异源/非回环请求 403 且不落盘，同源写/删成功。
- 权利边界：NOTICE.md 声明初音ミク角色名称/形象/肖像权归 Crypton Future Media, INC.，角色使用遵循 Piapro Character License（附 piapro.net 链接）；本包仅主张贡献者原创素材（LICENSE 声明），README 许可章节（双语配对）注明同一边界。Crypton 对商用再分发的逐案许可不做断言，作为使用者核实项如实记录。
- GUI 证据：隔离 scratch 实例（完成分支家族包，独立端口 dsh web）验证桌面渲染与帧动画、悬停菜单与属性条、商店弹层开/关、拖拽 localStorage 持久化、设置保存写入配置与重置清空、窄屏 390×844、零页面/控制台错误；证据归档 docs/archive/miku-pet-pr-1031/。
- semantic-attrs 契约与实现一致：客户端输出 data-dsh-part 锚点（sprite/menu/stats/shop/bubble/float），契约行 sprite 选择器修正为 descendant。

## Alternatives considered

- 以权利为由拒绝收录：否定 —— 本次评审要求的证据形式是角色边界文档 + 官方条款链接 + 作者声明（均已交付），无法核实部分（特定用途的 Crypton 许可）作为显式边界而非断言保留。
- 不入聚合、改走社区插件形态：否定，完成版保持原先的仓库内形态（聚合行、mountOnce 共存）。

## Consequences

dsh-miku-pet 重新随家族插件发布，附权利边界文档与受保护写路由。上方移除记录作为历史记录保留（其表面清理在本次重新收录前已完整执行）。社区索引与 Workshop 元数据不受影响（本包非社区条目）。