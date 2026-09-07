# 更新日志 / Changelog

本项目的所有重要变更都记录在此文件中。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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
