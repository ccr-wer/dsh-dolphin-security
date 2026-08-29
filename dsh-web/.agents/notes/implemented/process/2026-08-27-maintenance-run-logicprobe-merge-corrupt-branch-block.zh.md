# Agent Note: Maintenance run merges logicprobe update and blocks corrupted delete-message branch

Status: implemented

## Problem

2026-08-27 的第三次 /pr-issue-maintenance 运行复查了 zhu1090093659/dsh-web 默认范围下的五个开放 PR（assignees 明确包含 zhu1090093659；不含 Issue）：#1208、#1185、#1144、#1100、#1098。在档的全部正式 review 都来自本账号，协作者已审查只读规则对任何一个都不适用。本次运行要回答两个问题：#1208 与 #1185 在评审后的新推送是否真正回应了未决的 CHANGES_REQUESTED 事项，以及另外三个 PR 有什么变化。[milestone/logicprobe 记录](2026-08-26-maintenance-run-milestone-merge-logicprobe-review.md)与[六 PR 运行记录](2026-08-26-maintenance-run-community-index-six-pr-round.md)保存着同一队列更早的两轮结论。

## Decision

- PR #1208（dsh-logicprobe 描述更新）：批准，并以 rebase 方式合入 dev 为 722050b36。新头部提交补上了重新生成的 market/dist/manifest/plugins.json，其中描述与 community.json 完全一致，解决了最初「生成物过期」的阻塞项；描述中的版本表述统一为 0.5.x，正文附带 community-index、market-build、market-build --check 的输出；贡献证据复选框已勾选且检查全绿。作者同时修复了此前在案的上门禁性质建议：peer 依赖对齐 rc.6、声明了 dsh.engines.dsh、测试脚本加了可执行位、npm ci 无需 legacy-peer-deps。合入使用 gh pr merge --rebase，与此前的外部索引条目以保留贡献者署名的线性提交落库的方式一致。
- PR #1185（dsh-delete-message）：以「分支损坏」为由提交了 request-changes，取代此前「缺生成物」的意见。本地拉取显示分支头（fa0faf10b，UTC 2026-08-26 16:07 推送）相对基点只有一个提交，是对全部 3307 个受管路径的纯改名——每个顶层目录名末尾都追加了回车控制符（packages<CR>/、market<CR>/、.agents<CR>/ 等）：git diff --stat 显示 3307 files changed, 0 insertions(+), 0 deletions(-)，树中不再存在任何正常目录名。注册内容本身丢失：git grep 只在一个笔记文件里命中 dsh-delete-message，从未出现在 community.json。带 CR 路径的树在该作者之前就已存在，说明损坏来自受影响 checkout 的某次早期同步。评审要求贡献者不要修补旧分支，直接从最新 origin/dev 重来：重建 community.json 与重新生成的 market/dist/manifest/plugins.json，并把 node scripts/community-index、node scripts/market-build --check 的输出贴进 PR 正文。
- PR #1098、#1144、#1100 保持等待作者状态，本轮不做任何操作。在本账号发出后续评论后（#1098：rebase 加 subcategory、安装弹窗展示 lockCommit、Windows 与可复现证据；#1144：上游稳定性门槛；#1100：session-cwd 加固），三者均无新提交或回复——已通过提交时间线与 Issue 评论线程核实——因此本轮不发复审、不催促。
- 本轮没有候选走到分叉工作流授权阶段；既有的分叉工作流授权保持原状。

## Alternatives considered

- 曾考虑直接以「分支损坏」关闭 #1185：拒绝。关闭必须附带理由，贡献者应获得一次修复机会，「从 dev 重建」的指引让贡献得以延续且合并风险为零。
- 曾考虑用 squash 或 merge commit 合入 #1208：拒绝。仓库先例是以保留贡献者署名的 rebase 线性提交落库外部索引贡献（例如 #1093 对应 5ce48f011），维护者工作也以直推进入 dev，rebase 保持历史形态统一。
- 曾考虑更新两条既有维护运行记录而不新建本记录：拒绝。它们的第一轮决策原样成立，重叠只是部分的，按取代规则以交叉链接处理。

## Consequences

- dev 已包含 722050b36 处的 logicprobe 0.5.x 描述；其 community-index 与 market-build 一致性由绿色 PR CI 验证过，合入后的拉取确认只有预期的两个文件变更。
- #1185 保持开放并阻塞，直到重建分支到来；届时除检查新头部是否残留控制符外，此前的要求（提交重新生成的清单并在正文附校验输出）仍然适用。
- 下一次运行必须先重读 #1098、#1144、#1100 的回复线程再行动；在此之前三者不应被再次触碰。
- 凡 PR 推送成百上千个改名文件时必须在本地检查分支头内容；纯改名 diff 已经成功绕过一次 plugin-mount CI。

> 2026-08-27 后续运行更新：#1185 按本文要求以干净的单提交重建 f25166296 回归并合入为 5e85b6ebc；#1100 与搁置项的后续见[五项运行记录](2026-08-27-maintenance-run-delete-message-merge-four-registration-reviews.zh.md)。
