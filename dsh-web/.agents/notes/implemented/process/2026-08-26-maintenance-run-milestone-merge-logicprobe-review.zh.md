# Agent Note: 维护运行合并 dsh-milestone 并评审 dsh-logicprobe 0.5.x

Status: implemented

## Problem

2026-08-26 的第二次 /pr-issue-maintenance 运行继续按默认范围处理 zhu1090093659/dsh-web 的开放 PR 队列（assignees 明确包含 zhu1090093659 的 PR；不含 Issue）。共 6 个开放 PR，全部属于「第三方插件登记进社区插件索引」这一强制审查类型。其中 5 个在此前轮次已有本账号的 CHANGES_REQUESTED 评审，#1208（dsh-logicprobe 描述更新）从未被评审。6 个 PR 上均不存在其他协作者的正式 review，不适用协作者已审查只读规则。待解问题：#1093 声称的整改是否真实落实，以及 #1208 的 CI 为何失败。

## Decision

- PR #1093（dsh-milestone）：APPROVED，并以 squash 合入 dev（5ce48f011）。上轮 CHANGES_REQUESTED 的四项反馈逐项独立核实：上游 main（e4037c1）干净 clone 后 397/397 测试与 typecheck 全过；上游 CI run 32965289576 在 ubuntu/macos/windows × Node 22/24 矩阵上 6/6 全绿；qa/screenshots/ 提交了四张真实 GUI 共存截图；PR diff 恰好为 community.json + market/dist/manifest/plugins.json，条目一致（subcategory: chat），与 dev 05641860 无冲突合并。批准意见中记录三处不阻塞的文字修正：测试修复提交实为 e4d6230，3bc2a64 只是 pnpm 11 的 CI 后续修正；「首次运行 6/6 全绿」的措辞掩盖了第一次失败；PR 描述的「改动 5 个文件」已过期（实际 diff 为 2 个）。
- PR #1208（dsh-logicprobe 5.0 登记更新）：CHANGES_REQUESTED。diff 只更新了条目描述，未重新生成 market/dist/manifest/plugins.json；CI run 32945877245 精确失败在 market-build --check 报告 manifest/plugins.json 过期。新描述已对照上游 0.5.1 核实（README 与 package.json 一致：S1-S8/A1-A11、DS/DA/DD、前后回归、并发风险挖掘），上游维护活跃且 CI 绿，实用性确认。评审同时记录：「5.0」措辞在上游没有对应版本（npm 最新为 semver 0.5.1）；上游 peer 依赖自相矛盾（不加 --legacy-peer-deps 时 npm ci 报 ERESOLVE）且仍缺 dsh.engines.dsh 声明——两项为建议，不阻塞。
- 放行首次贡献者门控的 workflow 运行以获得权威检查结果：#1093 的 CI 与 agent-notes-guard（32965845027、32965844833）和 #1098 的同两项（32700358128、32700358142）。四个运行全部转绿；#1098 仍阻塞在其既有反馈项上（rebase + subcategory + 清单重生成、确认弹窗展示 lockCommit、Windows 与生命周期证据）。
- PR #1185、#1144、#1100、#1098：无动作。它们的 head 自本账号上次评审或评论后未变，全部既有评审项核实未落实；既有 review 继续有效，不重复评论。

前轮上下文：[维护运行评审六个社区索引 PR 并修复 dev CI 阻塞](2026-08-26-maintenance-run-community-index-six-pr-round.md) 与 [维护运行合并 Skyrail Cabin 并为社区插件设立证据门槛](2026-08-25-maintenance-run-skyrail-cabin-merge.md)。

## Alternatives considered

- 因三处文字不准对 #1093 再提 CHANGES_REQUESTED：否决。四项实质评审项均已核实落实，以提交归属和过期句子的瑕疵阻塞合并会歪曲真实风险。
- 不提交批准 review 直接合并 #1093：否决。ruleset 要求至少一个批准，且批准本身就是评审者的记录判断；绕过它会丢失验证轨迹。
- 由维护者在 #1208 作者分支上代为补生成过期的 market/dist 清单：否决，理由与前轮记录一致——缺失的生成物正是索引要求的贡献证据纪律，维护者向贡献者 fork 推送会掩盖验证责任归属。
- 对全部 6 个 PR 批量重新评审：否决。上轮评审后只有 #1093 有新提交；对未变的 head 重新评审只会重复既有反馈。

## Consequences

origin/dev HEAD 为 5ce48f011，已包含 dsh-milestone 社区索引条目（索引现共 40 个插件）；dsh-market.com 清单将在下一次从 dev 部署 market 时自动收录。#1208 等待作者重新生成并提交 market/dist；#1185、#1144、#1100、#1098 各自等待其逐项反馈落实。dsh.engines.dsh 声明的预期已在 #1185 与 #1208 上公开陈述，若成为长期要求，仍需补进索引文档。
