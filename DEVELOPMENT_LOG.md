# Dolphin 开发日志（DEVELOPMENT_LOG.md）

> 最后更新：2026-09-01

---

## 一、项目愿景与系统功能

### 系统名称
**Dolphin（小海豚）**

### 核心定位
将渗透测试方法论（信息收集 → 漏洞探测 → 利用验证 → 报告）转化为**主动防御巡检流程**，填补 DSH 生态中"主动防御巡检"的空白——不再被动等告警，而是像海豚巡游一样定期、主动地对目标主机进行安全扫描与评估。

### 发布状态（2026-09-01 里程碑）
- **npm**：`dsh-dolphin-security@0.1.0` 正式发布（官方 registry，dist-tags.latest = 0.1.0）
- **GitHub**：https://github.com/CCR-WER/dsh-dolphin-security（main 分支，与本地同步）
- **里程碑**：巡逻逻辑闭环打通——健康检查 → 远程扫描 → JSON 解析 → SecurityFinding 映射 → reports/ 存档全流程跑通；本地扫描报告亦可正常生成

### 核心功能
- **远程扫描**：通过 SSH 将 Semgrep 扫描命令下发至远程主机，对目标目录执行静态安全扫描
- **集群巡检**：支持批量主机并发巡检（cluster），按 tags / aliases / environment 过滤目标集合
- **漏洞验证**：连接健康检查、命令超时硬截止、断线重连语义控制（attempts 参数防非幂等命令重放）
- **加固建议**：基于扫描结果的 remediationHint 输出修复建议（后续引入 hos-forge 生成防御加固方案）
- **自动报告生成**：扫描结果统一映射为 SecurityFinding 数据模型，自动存档至 reports/ 目录

---

## 二、整体架构说明

Dolphin 采用「眼睛 + 手脚 + 大脑」三层架构：

### 扫描层（眼睛）—— `dolphin-core.js`
- 基于 **Semgrep** 的本地/远程代码扫描能力封装
- 提供统一 **SecurityFinding** 数据模型（file / line / col / severity / checkId / message / remediationHint / metadata）
- 核心接口：`scanDirectory(targetDir, options)`、`extractStructuredFindings(results)`
- 产出 Markdown + JSON 双报告，写入 `reports/`

### 执行层（手脚）—— `dolphin-ssh-core.js`
- 基于 **dsh-ssh** 裁剪融合出的 SSH 引擎（1,266 行 ESM 单文件）
- 提供 `exec` / `cluster` / `test` / `upload` / `download` / `ls` 等远程操作能力
- 连接池复用、ProxyJump 跳板链、SFTP 传输、断线自动重连（可配 `attempts` 关闭命令重放）
- ssh2 惰性加载：未安装依赖的机器也能安全 import

### 融合控制器（大脑）—— `dolphin-patrol.js`
- 主控制器：将扫描命令通过 SSH 下发至远程主机
- 探测远端 Semgrep 是否就绪，缺失时走 upload + 远端执行脚本的 fallback 路径
- 对返回的 JSON 进行结构化处理，映射为统一的 SecurityFinding 格式并本地存档
- 核心接口：`runPatrol(alias, targetDir)`、`buildRemoteScanCommand(targetDir, rulesConfig)`、`runLocalScan(targetDir)`、`test()`
- **已闭环（2026-09-01）**：端到端巡逻流程打通并实测通过（真实靶场扫描检出 4 处问题：ERROR 3 / WARNING 1）；runPatrol 采用 try/finally 管理引擎生命周期，杀进程 bug 彻底修复

---

## 三、所用开源项目及其协议

| 项目 | 协议 | 用途 |
|---|---|---|
| dsh-code-scan | MIT | Semgrep 扫描能力封装，作为基础扫描模块 |
| dsh-plugin-hos-forge-v2 | MIT | 参考其 MCP 编排思路（后续引入防御加固建议生成） |
| dsh-web（dsh-ssh 子包） | Apache-2.0 | 提供 SSH/SFTP 能力，已裁剪为 dolphin-ssh-core.js |
| ssh2 | MIT | 底层 SSH 协议库（客户端 + 服务端） |
| semgrep | LGPL-2.1 | 开源静态分析引擎 |

> 第三方许可证全文存放于 `THIRD_PARTY_LICENSES/`（dsh-code-scan-MIT.txt、dsh-web-Apache-2.0.txt），随包分发，满足 Apache-2.0 §4 分发要求。

---

## 四、开发路径与踩坑记录（Critical Path & Pitfalls）

### 坑 1：Semgrep 命令行卡死在 "Loading rules"
- **现象**：执行 semgrep 扫描时进程长时间卡在加载规则阶段，无输出无退出
- **根因**：未正确切换工作目录，规则加载路径解析异常
- **解决**：严格使用 `cd /d` 切换到目标目录后再执行扫描命令，问题消失

### 坑 2：子模块（gitlink）问题
- **现象**：dsh-web / dsh-code-scan 以子模块形式嵌套，主仓库只见 gitlink 指针，代码不可追踪
- **解决**：强制展平嵌套 Git 仓库，删除嵌套 `.git` 残留，确保融合后的代码在本地仓库中可追踪（现 dsh-web 3,413 个文件、dsh-code-scan 7 个文件均已纳入版本库）

### 坑 3：dsh-ssh 源码依赖缺失与遥测问题
- **现象**：dsh-ssh 依赖 cordis、@deepseek-ai/dsh-settings（devDependencies）等 DSH 宿主专属上下文；`src/client` 含 dsh-market 遥测心跳，独立运行即崩
- **解决**：严格按照《SSH_RECON_REPORT.md》【方案 A】裁剪——移除 cordis、dsh-settings、schemastery、浏览器区遥测（含 dsh-market 心跳）、pty 终端、tunnel 转发，仅保留 engine / store / protocol 核心引擎，实现零依赖跨界（运行时只依赖 ssh2）

### 坑 4：ESM 与 CJS 兼容性问题
- **现象**：Dolphin 根 package.json 声明 `"type": "module"`，而 ssh2 是 CJS 包，直接 require 报错
- **解决**：使用 `createRequire(import.meta.url)` 兼容引入 CJS 的 ssh2，且采用惰性加载——未安装 ssh2 的机器也能正常 import 与自检，仅真实建连时才解析依赖

### 坑 5：runPatrol 执行完进程挂起（杀进程 bug —— engine.dispose()）
- **现象**：巡逻命令跑完、报告已生成，但 Node 进程不退出，CLI 表现为"跑完卡住"
- **根因**：自建的 SshEngine 未 dispose——引擎持有连接池 + sweepTimer + ssh2 keepalive 定时器，keepalive 的 setInterval 只在 socket close（client.end()）时清除，事件循环被挂住
- **解决**：runPatrol 入口用 try/finally 保证出口必达；注入的引擎（options.engine 存在）不越权关闭，自建的才 dispose。**已彻底修复**（--live 实测退出码 0，进程正常收尾）

### 坑 6：npm 发布被 2FA 强制要求拦截（E403 / EOTP）
- **现象**：npm publish 多次被拒，先后报 E403（"Two-factor authentication or granular access token with bypass 2fa enabled is required"）与 EOTP（"This operation requires a one-time password from your authenticator"）
- **根因**：npm 账号开启了"发布包必须两步验证"（2FA）策略，纯密码会话无发布权限；与包名、版本号均无关
- **解决**：用户通过 2FA 双重验证（提供一次性验证码 OTP）后发布成功

### 坑 7：prerelease 版本号不是发布被拒的真正原因
- **现象**：以 0.1.0-beta 发布被拒，曾以为换成正式版号即可绕过限制
- **事实**：改为正式版 0.1.0 后仍被 2FA 拦截——真正的限制来自账号安全策略而非版本号；最终成功发布的正式版本即 0.1.0

### 坑 8：GitHub 推送 Connection reset 与远端冲突合并
- **现象**：推送时多次出现 **"Recv failure: Connection was reset"**（网络重置，连接被远端断开），且远端仓库已存在初始内容时产生推送冲突
- **解决**：用户手动用 git 处理远端冲突并合并（提交 `88b7c81 resolve license conflict`），随后推送成功；`git remote -v` 确认 origin = https://github.com/CCR-WER/dsh-dolphin-security.git，main 分支与远端同步

---

## 本次重大决定（2026-09-01）

- **改包名**：`dolphin-security` → **`dsh-dolphin-security`**（融入 DSH 生态命名规范，不再坚持旧包名；发布前探测确认主前缀未占用，无需退到 scoped 名 @ccr-wer/）
- **DSH 生态对齐**：package.json 新增 `dsh.bundle.patch` 配置与 `cordis.patch.yml`（insert: id=dolphin），keywords 补 dsh / dsh-plugin
- **文档完善**：README.md 与英文版 README_EN.md 同步完善（发布前已中性化灰盒表述、补第三方许可声明）

---

## 五、下一步计划（Roadmap）

1. **完善"系统安全培训"体系**：项目已上 GitHub、npm 包已发布，可依托 Dolphin 的巡检结果沉淀安全培训素材与演练场景（如漏洞样本、加固前后对比），形成可复用的培训体系
2. **推进 hos-forge 防御融合**：从"参考其 MCP 编排思路"走向实际接入——基于扫描结果生成防御加固建议，输出可执行的加固方案（加固建议 → 自动生成补丁/配置变更）
3. **完善统一数据模型**：SecurityFinding 增加代码片段（codeSnippet）、列号（col/end）、CVE 映射等维度，提升报告可读性与可追溯性
4. **npm 包持续维护**：按 SemVer 规范迭代发布（下次发版直接使用 --otp 或 bypass-2FA token 走通 2FA）

---

## 六、纯功能型插件适配层（2026-09-02）

### 背景
《docs/DSH_UI_RECON_REPORT.md》排查结论：Dolphin 是纯 Node 库/CLI——核心文件零 Cordis 契约（无 name/inject/apply）、无 main 入口、无 peer 依赖声明，导致 dsh 即便装上包也解析不到插件。按报告建议先落地"纯功能型插件"适配层（不做 UI）。

### 交付内容
- **`index.js`（新）**：Cordis 宿主侧适配层，实现完整契约三要素：
  - `export const name = 'dolphin'` —— 与 cordis.patch.yml 的 insert[].id 对齐
  - `export const inject = ['tools']` —— 依赖 tools 服务，Cordis 等其就绪后再 apply
  - `export function apply(ctx)` —— 用 @deepseek-ai/dsh-tools 的 defineTool 注册两个工具：
    - `dolphin_scan`：包装 `runLocalScan(targetDir)`，本地 Semgrep 扫描
    - `dolphin_patrol`：包装 `runPatrol(alias, targetDir)`，描述中明确提示"先登记 SSH 主机别名"
  - 工具逻辑全部委托 dolphin-patrol.js，核心库保持零 DSH 依赖、双形态并存；无 UI / client 半区
- **`package.json`**：新增 `"main": "./index.js"`；files 白名单补 index.js；新增 peerDependencies `@deepseek-ai/cordis@^4.0.1` 与 `@deepseek-ai/dsh-tools@^0.1.1-rc.2`（版本对齐宿主 dsh@0.1.1-rc.2 内嵌实现）

### 验证结果
- **契约冒烟**：用宿主真实 dsh-tools 的 defineTool 校验——name/inject/apply 正确，apply 注册 2 个工具，字段级 `required: true` 注解被正确编译为标准 JSON Schema `required` 数组
- **打包**：npm pack 17 文件 / 51.4 kB，index.js、main、peer 均在 tarball 内
- **真实加载链路（隔离 DSH home 实测）**：`dsh plugin --profile web add <本地 tarball>` → 包装入 node_modules、`dsh.profile.bundles` 自动追加 `dsh-dolphin-security`、`dsh --profile web --dump-config` 配置树出现 `# == dsh-dolphin-security → - id: dolphin`（挂载成功判据）
- **发布状态**：npm registry 上的 0.1.0 不含 index.js；`dsh plugin --profile web add dsh-dolphin-security`（registry 版）需先发布含新入口的 0.1.1（走 OTP / bypass-2FA token）后才对远端生效

### 踩坑：pnpm 11 的构建脚本门禁（allowBuilds）
- **现象**：`dsh plugin add` 在 profile 内用 pnpm 11 装包时，ssh2 / cpu-features 的构建脚本被默认忽略（ERR_PNPM_IGNORED_BUILDS），pnpm 非零退出导致 dsh 判定失败、**bundles 未注册**
- **关键细节**：pnpm 11 已不再读 package.json 的 `pnpm` 字段（会 WARN "no longer read"），设置的正确位置是 profile 的 `pnpm-workspace.yaml`：`allowBuilds: { cpu-features: true, ssh2: true }`（该文件由 pnpm add 自动生成，含待批准的占位）
- **放行后**：ssh2 的 node-gyp 可选加密绑定编译成功，pnpm 正常退出，bundles 自动注册完成

### 提交
- `25fc78b` feat: add cordis plugin entry (index.js) registering dolphin_scan/dolphin_patrol tools
