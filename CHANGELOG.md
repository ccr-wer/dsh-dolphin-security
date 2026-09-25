# 更新日志 / Changelog

本项目的所有重要变更都记录在此文件中。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.2.6] — 2026-09-25

### 新增 / Added
- **内置规则集：1 条 → 162 条**。以 GitLab SAST Rules（上游 commit `53bf5cf6df3c51b6c02110f5a638b5e6213666cd`）为源，逐文件判定许可证后收录 java 55 / python 68 / javascript 11 / go 27 共 **161 条**，另加自研 `dolphin.hardcoded-credentials`（CWE-798 硬编码凭据）**1 条**，合计 162 条 / 162 个唯一 ID。许可分布：**MIT 136**（GitLab 侧 135 + 自研 1）、**Apache-2.0 26**（go/ 下源自 securego/gosec），全部在白名单内，逐条注入 `metadata.license`。规则集为随包分发的单文件 `rules/dolphin-core.yml`，不再依赖远端 registry 拉取 `p/*` 规则包（规避 Semgrep SRL v1.0 的禁转售条款）。逐条来源/许可/注入结果见 `rules/dolphin-core.manifest.json`。
- **规则 ID 索引与 `check_id` 归一化**（`buildRuleIdIndex()` / `normalizeCheckId()`）：semgrep 对「文件型 `--config`」会在 `check_id` 前拼接配置路径的点号化前缀（配置不在子进程 cwd 子树内时退化为完整绝对路径），导致同一规则在不同机器/目录下 ID 漂移，且把本机安装路径泄漏进报告。现改为以规则文件中的真实 ID 集合做**最长后缀精确匹配**，对 cwd、盘符、远端路径一律免疫。

### 修复 / Fixed
- **便携 wheel 包平台硬闸门**：Windows 宿主上执行 `pip download --platform=manylinux*` 只改 wheel 标签、**不改环境标记求值**，`sys_platform == "win32"` 仍为真；新版 semgrep 的 `pywin32` 依赖没有 manylinux wheel，pip 于是静默退避到 semgrep 1.136.0 + protobuf 4.25.9（**退出码仍为 0**，失败无声），装到远端 Python 3.14 上必崩（`TypeError: Metaclasses with custom tp_new are not supported`）。现改为：Windows 宿主且缓存未命中时**明确拒绝备包并给出处置指引**（在 Linux 侧下载或预置 `DOLPHIN_SEMGREP_CACHE`），不再生成坏包。
- **部署失败信息被 pip warning 顶掉**：三级部署链（pipx → venv → 便携包）报错时改为优先取「安装步」的 stderr；原逻辑取最后一步输出，npm/pip 的警告会把真实错误冲掉。新增 `composePortableError()` 统一收口。
- **venv 失败路径未登记清理**：`python3 -m venv` 在缺 `python3.14-venv` 的发行版（如 Ubuntu 26.04）上会失败并报 `ensurepip is not available`，但残留目录原先未进 `cleanupDirs`，导致远端 `/tmp/dolphin-venv-*` 空壳累积。现无论成败都登记，扫描结束后统一回收。

### 变更 / Changed
- **报告落盘逻辑去重**：`dolphin-core.js` 抽出 `writeReports()`（`runScan()` 与 `--mock` 自测路径共用），`dolphin-patrol.js` 抽出 `writeJsonReport()`（`runPatrol()` 与 `runLocalScan()` 共用），消除四处重复的「建目录 → 序列化 → 写入」代码。
- **开源合规中性化**：`.gitignore` 补充 `staging/`（本地规则集构建/审计脚本，内含本机绝对路径）与 `npm-dist/`（0.2.5 解压快照）；README、示例与源码注释中的本机绝对路径全部改为 `<插件目录>`、`C:\Users\<user>` 等中性写法。

### 说明 / Notes
- 自检 **42 项全部通过**（改动前基线同为 42/0，本次重构只去重、不改行为）。端到端回归：Windows 与 WSL 两侧对同一靶场检出**逐条一致**（13 处 = ERROR 7 + WARNING 6），`checkId` 全部为纯规则 ID、无路径前缀，两次巡逻 findings 完全可复现。
- 远程巡逻端到端约 32 秒（含 SFTP 上传约 55.7 MB 便携包）。
- 本轮不涉及 Skill 侧封装包（`skill-package/`，已独立成库 `github.com/ccr-wer/dolphin-security-skill`）。

## [0.2.5] — 2026-09-13

### 修复 / Fixed
- **`peerDependencies` 版本范围修正**：`@deepseek-ai/dsh-tools` 由 `^0.1.1-rc.2` 调整为 `^0.1.5-rc.1`（`peerDependencies` 与 `devDependencies` 两处）。按 semver 规范，prerelease 版本仅在相同 `[major, minor, patch]` 元组内匹配，原范围连宿主 `0.1.2-rc.1` 都不满足（实测 `satisfies('0.1.2-rc.1', '^0.1.1-rc.2') === false`）；在启用 `strict-peer-dependencies` 或宿主改为严格校验时会导致装配失败。新范围覆盖 `0.1.5-rc.1` / `0.1.5-rc.2` / `0.1.5` 正式版。`@deepseek-ai/cordis` 保持 `^4.0.1`（0.1.2 与 0.1.5 宿主均依赖 `^4.0.2`，本就满足）。

### 说明 / Notes
- 已对 DSH `0.1.5-rc.1` 做完整兼容性核对（对 `dsh` / `dsh-tools` / `dsh-agent` / `dsh-session` 四包做 0.1.2-rc.1 ↔ 0.1.5-rc.1 逐文件 diff）：`exec.agent?.session?.header?.cwd` 调用链在 0.1.5 中完整保留；`ctx.tools.register(defineTool(...))` 与 `execute(args, exec)` 签名未变；`dsh.bundle.patch` 挂载机制未变。Inbox 模块（`@deepseek-ai/dsh-agent` 的 `lib/types/inbox.*`，0.1.2 中即标注 `@internal — not a plugin extension point`）在 0.1.5 中被内部重构，本插件全库无引用，影响为零。
- 回归验证：本地扫描与远程 SSH 巡逻两条链路均命中靶场 21 处（14 ERROR / 7 WARNING），三包规则集（`p/security-audit` + `p/owasp-top-ten` + 自建 CWE-798）全部生效。

## [0.2.4] — 2026-09-09

### 修复 / Fixed
- **Windows Git Bash 远端路径映射修复**：远端默认 shell 为 Git Bash/MSYS 时，exec 通道 `/tmp` 映射到 `%TEMP%`，而 SFTP 通道（`sftp-server.exe`）把 `/tmp` 映射到驱动器根的 `C:\tmp`，两通道错位导致远程规则文件「上传到 A 处、扫描却去 B 处找」（自建 CWE-798 规则静默失效）。新增 `detectRemoteTempBase()`：探测到 MSYS 环境后，exec 仍用 `/tmp`、SFTP 改用「去盘符 + 正斜杠」的 Windows 原生路径（`/Users/<user>/.../Temp`），两通道指向同一物理目录；Linux/macOS 行为不变。实测 Windows 主机远程巡逻恢复三包规则全量命中（靶场 21 处：14 ERROR / 7 WARNING）。

## [0.2.3] — 2026-09-09

### 新增 / Added
- **本地 `dolphin_scan` 规则集与远程巡逻对齐**：默认规则由单包 `p/security-audit` 升级为三包 `p/security-audit` + `p/owasp-top-ten` + 自建规则（绝对路径解析），本地扫描与 `dolphin_patrol` 输出一致（实测靶场命中 4 → 21，14 ERROR / 7 WARNING）。
- `package.json` 补充 `exports` 字段映射（`.` → `./index.js`），ESM 插件入口暴露完整。

## [0.2.2] — 2026-09-07

### 修复 / Fixed
- **LICENSE 许可证声明修复**：清除一次未正确解决的 merge 冲突残留（`<<<<<<< HEAD` / `=======` / `>>>>>>>` 标记与误入的 MPL-2.0 文本），恢复为干净的纯 MIT 文本（44 行）+ 第三方声明，消除 SPDX 扫描器的 NOASSERTION 误判。
- README / README_EN 版本号同步至 v0.2.2。

## [0.2.1] — 2026-09-06

### 新增 / Added
- **默认规则集升级**：`p/security-audit` → `p/security-audit` + `p/owasp-top-ten` + 自建规则，补齐 CWE-79/89/22/95 官方空白（实测靶场命中 4 → 21，零误报）。
- **自建规则 `dolphin.hardcoded-credentials`（CWE-798）**：官方 registry 的 `hardcoded-password-default` 已消失，社区规则集全线漏报硬编码凭据；本规则修复 JSON 冒号引号风格漏报，随 npm 包分发。
- **多规则包支持**：`rulesConfig` 支持空格分隔多包/文件（逐包展开 `--config`）；远程巡逻时本地规则文件自动上传远端并改写路径、扫描后自动清理。
- `rulesConfig` 含空格的注入自检用例更新（多 token 语义下恶意串被中性化为 `--config` 参数值）。

### 修复 / Fixed
- 自建规则路径改为模块目录绝对路径解析，消费者在任意工作目录运行均可加载。

## [0.2.0] — 2026-09-06

### 新增 / Added
- **跨平台支持**：Windows / Linux / macOS / WSL 全平台可用（Node.js >= 20），零硬编码路径、纯 JS SSH 层，控制端与目标端任意 OS 组合双向实测通过。
- **远端 semgrep 隔离部署链**：远端缺失 semgrep 时自动按优先级部署——`pipx`（用户级隔离）→ 临时 venv（`/tmp`）→ 便携 wheel 包 SFTP 上传离线安装（`--no-index --target`），三种方式均不污染系统。
- **部署预检与自动清理**：每步部署前输出策略/上传字节/远端下载量/风险评估；所有远端临时目录在扫描结束后自动回收。
- **数据路径文档**：README 补充 `DOLPHIN_HOME` / `DSH_HOME` / `DOLPHIN_REPORTS_DIR` / `DOLPHIN_SEMGREP_CACHE` 说明。

### 安全 / Security
- 新增硬闸门 `assertNoPrivilegeEscalation`：全链路禁止 `sudo` 与 `pip install --break-system-packages`，命中即终止巡逻。
- 开源合规：隐私审查（无个人隐私信息）、`.gitignore` 强化（报告/测试脚本/锁文件/密钥资产路径不入库）。

### 移除 / Removed
- 旧的「上传 node 脚本」远端回退路径（远端无 semgrep 时必然失败的死路径），由隔离部署链取代。

## [0.1.1] — 2026-09-02

### 新增 / Added
- Cordis 插件入口（`index.js`），注册 `dolphin_scan` / `dolphin_patrol` 工具，正式融入 DSH 生态。
- 包名确立为 `dsh-dolphin-security`。

## [0.1.0] — 2026-09-01

### 新增 / Added
- 首个公开版本：基于 Semgrep 的本地扫描层 + 基于 SSH 的远程执行层，主动巡检工作流（健康检查 → 扫描 → 结构化报告）。
