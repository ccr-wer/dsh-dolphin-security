# Agent Note: 维护运行合入 dsh-delete-message 并完成四项索引登记评审

Status: implemented

## Problem

同一天的第五次 /pr-issue-maintenance 运行，对象为 zhu1090093659/dsh-web 默认范围（assignees 明确包含 zhu1090093659 的开放 PR；除非显式指定不纳入 Issue）。七个开放 PR 继承此前四轮的状态；[上一份记录](2026-08-27-maintenance-run-logicprobe-merge-corrupt-branch-block.md)留有既定要求：行动前先重读 #1098/#1144/#1100 线程，对重建后的 #1185 头部复查控制符损坏与生成物要求。本轮要决定重建后的 #1185 可否合入、哪些更新的登记具备接受条件，并为从未评审过的三项（#1224、#1235、#1239）开启初审。

## Decision

- #1185（dsh-delete-message）：批准并合入为 5e85b6ebc。重建头 f25166296 是基于 baf7b4016 的单提交，相对 origin/dev 的差异恰为 community.json（+12）与 market/dist/manifest/plugins.json（+13）两处纯追加，控制符损坏消失；本地 node scripts/community-index --check 通过（41 entries）。baf7b4016..1128f2e8a 未触碰 community.json、market/dist 与 scripts/market-build，提交内的重新生成物在合入时仍然有效。上游 npm 自 2026-08-25 起仍为 dsh-delete-message@0.2.1。两条 action_required 工作流运行（agent-notes-guard 与 CI）经人工审批解除首次贡献门控。
- 合入方式偏差记录在案：使用 gh pr merge --squash 而非外部索引贡献既定的 rebase 惯例（[上一轮](2026-08-27-maintenance-run-logicprobe-merge-corrupt-branch-block.md)）。仅当贡献本就是单提交时成立——结果形态与 rebase 一致；多提交重建仍须走 rebase。
- #1100（termanli，fulltext-search）：上游证据经 API 复核属实（commit 3d906468b0 存在、tag v0.1.1 已发布、scripts/security-test.mjs 覆盖伪造 sessionId 回归、上游 CI 最近三次全绿含当日）。条目补了 subcategory dev，并以双语写明一键安装不会自动带上 dsh-better-sidebar。已发整合回复；剩余两个合入阻塞：基于 #1185 落地后的新 dev 尾部重新生成 market/dist（否则必然 rank 冲突），并删除贡献者写入的 .agents/notes 三件套（guard-agent-notes 规则禁止贡献者改动该目录）。
- #1224（slywalker2006，dsh-passwords）：名字叫 passwords，实际是面向 DSH web 的多租户认证网关（bcrypt 登录、子账号与限额、ACME 自动 HTTPS、限流、审计日志）。在上游 HEAD 405c0fe 完成本地源码审计：npm ci 干净安装后 npm test 128/128 全绿（macOS）；密码只存 bcrypt 哈希；username 与审计字段 AES-256-GCM 加密并用 HMAC 做等值索引；SETUP_KEY、MCP_JWT_SECRET 与加密密钥三者分离且派生风险有说明；证书原子写入权限 0600；插件形态合规（dsh.bundle.patch）。与官方 remote-web-ui 的配对式单人访问比对：互补层级而非重复能力。已发初审：阻塞项为真实中文描述与网关导向条目名、rebase 加重新生成（尾部冲突必然）、以及一段部署复现记录（安装、首建 admin、子账号限额生效、卸载恢复其 cli 对宿主配置的修改与重启行为）。
- #1235（Zhiyi-Zhao，notion-skill）：确认为插件形态而非误投技能包——cordis.patch.yml 以 host-plane skill provider 行注册 skills/notion/SKILL.md 配纯标准库 Python 助手；MIT 许可；存在 ci.yml；provider.test.mjs 与 test_notion_api.py 双层测试；token 解析支持 NOTION_TOKEN 环境变量或 <dsh_home>/notion/token 文件。已发初审：阻塞项为 rebase 加重新生成，以及部署复现（安装、注册表可见、会话内一次真实 search/read、卸载无残留）；非阻塞建议创建 token 文件时 chmod 600。
- #1239（UnusWhite，catppuccin 皮肤）：经 assignees 关联进入评审。核验 v2 manifest 合规、381 行 Latte/Mocha 双套令牌映射、小范围披露式 patches.css、双语 README 对、未触碰 skin-center 包白名单、order 1002 无冲突、预览图为与双调色板一致的真实 GUI 截图。已发初审，两个流程性阻塞：删除随附的 .agents/notes 三件套，并在最新 dev 上补齐本地验证命令与结果（基线 67a747f59 落后约十四个提交）。所有者随后一小时内复核推翻该路径：维护者评论已撤回，PR 按不构成纯皮肤资产收录关闭——提交夹带了 market/dist/styles.js、manifest.js、sitemap.xml、manifest/skins.json、tryon-assets 等整包发布构建产物，其重建属于收录确认后的维护侧工作；已邀请作者以纯资产形态重开。
- #1144（deepsea）与 #1098（agent-plugins-market）继续等待作者；线程复读确认无动静，遵循上一份记录。

## Alternatives considered

- 为贴合惯例对 #1185 改用字面 rebase：拒绝事后折腾；重写已推送的 dev 被禁止，而 squash 已复现惯例目标的双产物单提交形态。记录偏差而非掩盖。
- 对每个外部头部主动解锁 action_required 工作流：限定给评审已实质定案的头部（本轮仅 #1185）；#1100 推迟到其承诺的新推送，避免让死头白烧一次可预见的 guard 失败。
- 手工解决清单尾部冲突以便 #1185 后立刻连落 #1100 或 #1235：拒绝。重新生成属于贡献分支及必需检查之内，机械合并会掩盖 rank 推导，且三位作者当日均以小时级响应。
- 每个 PR 单独成篇：拒绝；维护运行系列格式本就以交叉链接整合一轮决策。

## Consequences

- dev 前进至 5e85b6ebc，包含 dsh-delete-message 登记（41 entries，rank 41 已占用）；三位待办登记作者均已被告知对该基线重新生成后再推送。
- #1239 经所有者判定直接关闭而未进入回路（见决策条目）；其余三个作者回路保持打开（#1100、#1235、#1224 内容定案待清单落实）。按当日节奏预计当天回流；下一次运行必须先重读这些线程再动手。
- 惯例细化记录：单提交重建可走 squash；其余外部索引贡献维持 rebase 规范。
- dsh-passwords 的稳定性证据依赖维护者本地执行（上游无 CI）；其发布版本明显越过 2.6.3 时需复核。
- 验证用克隆与工作树位于 /tmp 并在使用后清除；共享检出除本笔记落库外未被改动。
