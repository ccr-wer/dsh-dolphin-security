# Dolphin 开发日志（DEVELOPMENT_LOG.md）

> 最后更新：2026-08-31

---

## 一、项目愿景与系统功能

### 系统名称
**Dolphin（小海豚）**

### 核心定位
将渗透测试方法论（信息收集 → 漏洞探测 → 利用验证 → 报告）转化为**主动防御巡检流程**，填补 DSH 生态中"主动防御巡检"的空白——不再被动等告警，而是像海豚巡游一样定期、主动地对目标主机进行安全扫描与评估。

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

---

## 三、所用开源项目及其协议

| 项目 | 协议 | 用途 |
|---|---|---|
| dsh-code-scan | MIT | Semgrep 扫描能力封装，作为基础扫描模块 |
| dsh-plugin-hos-forge-v2 | MIT | 参考其 MCP 编排思路（后续引入防御加固建议生成） |
| dsh-web（dsh-ssh 子包） | Apache-2.0 | 提供 SSH/SFTP 能力，已裁剪为 dolphin-ssh-core.js |
| ssh2 | MIT | 底层 SSH 协议库（客户端 + 服务端） |
| semgrep | LGPL-2.1 | 开源静态分析引擎 |

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

---

## 五、下一步计划（Roadmap）

1. **完善 dolphin-patrol.js 主控制器**：打通真实远程巡检闭环（runPatrol 对真实主机执行扫描、回传、存档全流程）
2. **引入 hos-forge**：基于扫描结果生成防御加固建议，输出可执行的加固方案
3. **完善统一数据模型**：SecurityFinding 增加代码片段（codeSnippet）、列号（col/end）、CVE 映射等维度，提升报告可读性与可追溯性
