# Agent Note: 维护运行评审六个社区索引 PR 并修复 dev CI 阻塞

Status: implemented

## Problem

2026-08-26 的 /pr-issue-maintenance 运行按默认范围覆盖 zhu1090093659/dsh-web 的开放 PR 队列（assignees 明确包含 zhu1090093659 的 PR；不含 Issue）。共 6 个开放 PR，全部属于「第三方插件登记进社区插件索引」这一强制审查类型，需要实用性、上游稳定性与生态兼容性三轴证据。其中 #1144、#1100、#1098、#1093 已有本账号的 CHANGES_REQUESTED 评审，#1201、#1185 从未被评审。所有既有正式 review 均来自当前认证账号自己，不适用协作者已审查只读规则。此外 dev 分支 CI 因一个预存失败而红：5b22d127 把设置页标题改为 "Web Plugins" 却未同步 webui-section.spec.tsx 的断言，导致每个 PR 的 "CI checks" 任务失败。

## Decision

- dev CI 修复经 owner 通道直接推送（不开 PR）：bf5fa57c7 把 webui-section.spec.tsx 断言同步为改名后的 "Web Plugins"，c4fa3b6fb 清扫剩余 "Web UI Plugins" 文案。两个提交是此前维护工作已在本地完成的；rebase 到 origin/dev 0a908328d 后重新验证测试套件（66/66）再推送。
- PR #1201（dsh-mcp-manager + dsh-provider-usage）：APPROVED。两个条目通过 scripts/community-index 规则（39 条、id 无重复），market/dist/manifest/plugins.json 派生一致（rank 38/39），上游仓库公开且活跃（当日发布 v0.1.13），两个 npm tarball 自包含、零运行时 @deepseek-ai 导入。失败的检查是上述 dev 预存问题，dev 修复后已触发失败任务重跑。评审中记录两个不阻塞的小项：dsh-provider-usage 是唯一缺 subcategory 的条目；repo 链接指向仓库根而非作者此前条目使用的包目录形式。
- PR #1185（dsh-delete-message）：CHANGES_REQUESTED。条目 schema 正确、插件可信（loopback 写隔离、官方 surface 替换契约、零运行时依赖），但 PR 未重新生成 market/dist/manifest/plugins.json，CI 精确失败在该门禁（market-build --check 报告 manifest/plugins.json 过期）；PR 描述中「无需提交生成文件」的说法对市场清单不成立。评审同时要求上游 package.json 补 dsh.engines.dsh 声明（插件管理器更新门控读取该字段）。
- PR #1093（dsh-milestone）：作者 re-request 后重新 CHANGES_REQUESTED。评审后的 force-push 只是重写同一登记提交，四项反馈零落实（上游测试在 jsdom localStorage 下仍失败、上游无 CI、PR 描述仍引用被否决的「397 项单测」证据、真实 GUI overlay 共存证据仍空）。因首次贡献者门控而 action_required 的 CI 与 agent-notes-guard 运行已放行，以获得权威的社区索引与市场清单检查结果。
- PR #1100（dsh-fulltext-search）：跟进评论，未提交新 review（评审后 PR head 未变）。确认上游在评审后真实修复了 P0 问题（27773003bf：搜索根仅取服务端会话记录，伪造 sessionId 返回 404；scripts/security-test.mjs 回归；v0.1.1；三系统 CI 全绿）。PR 侧剩余项：rebase 到当前 dev（过期清单仍含已移除的 miku-pet、缺 dsh-context）、补 subcategory、更新引用的上游证据、写明 DSH-better-sidebar 前置依赖。已放行 fork 门控的 CI 运行。
- PR #1098（dsh-agent-plugins-market）：更正评论。08-25 复查中「无取消路径回归测试」的判定有误：tests/install-gate.test.ts 与 market-section-render.test.ts 自上游 1509f670（2026-08-24T14:43，早于该评论）起已覆盖；npm tarball 的 files 白名单不含 tests/，大概率导致误读。仍未落实：rebase 加 subcategory 加 market/dist 重新生成、确认弹窗未展示锁定来源提交（lockCommit）、Windows 与可复现的安装/启用/重启/禁用/卸载证据。
- PR #1144（dsh-deepsea）：无动作。评审后 head 未变，九项反馈经逐项核实均未落实（上游评审后提交仅为文案与版本号），分支与 dev 冲突，CI 仍因清单过期而红。既有评审维持有效。

这些长期评审的上一轮背景见 [维护运行合并 Skyrail Cabin 并把守社区插件证据门槛](2026-08-25-maintenance-run-skyrail-cabin-merge.md)。

## Alternatives considered

- 等 #1201 的 CI 转绿后才批准：否决，因为唯一失败已证实是与 PR diff 无关的 dev 侧预存测试失配；批准中写明了原因与修复提交，合并仍以重跑通过为前提。
- 由维护者侧替作者补生成过期的 market/dist 清单：否决，因为缺失的重新生成正是索引要求的贡献证据纪律，替作者推送到其 fork 会掩盖「谁验证了什么」。
- 在无回应的 force-push 后关闭 #1093：否决，插件真实、实用性已获认可，正确做法是给出逐条复审并放行 fork CI。
- 不更正 #1098 取消测试的误读：否决，错误的评审陈述不更正会让作者在错误前提上持续受阻。

## Consequences

dev HEAD 为 c4fa3b6fb，其 CI 门禁应恢复绿色；#1201 已获批准，待重跑通过后合并。四个登记 PR 仍阻塞在作者侧，均带有逐条具体反馈；#1093 与 #1100 首次获得实际执行的仓库 CI。第三方索引条目的 dsh.engines.dsh 声明要求已在 #1185 上公开提出，若成为长期要求应补进索引文档。