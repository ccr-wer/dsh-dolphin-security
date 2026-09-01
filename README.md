# Dolphin（小海豚）—— 主动巡检型安全防御插件

> 将渗透测试方法论（信息收集 → 漏洞探测 → 利用验证 → 报告）转化为**主动防御巡检流程**，填补 DSH 生态中"主动防御巡检"的空白。
> 不再被动等告警，而是像海豚巡游一样，定期、主动地对目标主机做安全扫描与评估。

当前版本：**v0.1.0-beta**（Windows 预览版）

---

## ⚠️ 免责声明

**本项目为技术研究工具，严禁用于非法渗透测试。**

- 本工具仅限用于**你拥有合法所有权**、或**已获得明确书面授权**的系统与代码。
- 使用本工具对任何第三方系统发起扫描、探测或连接，可能违反《网络安全法》《刑法》等相关法律法规。
- 作者不对任何因使用、误用或滥用本工具造成的直接或间接损失承担责任。
- **你必须获得明确授权方可使用。** 使用者需自行承担全部法律责任与后果。

---

## 适用环境

| 项目 | 要求 |
|---|---|
| 操作系统 | Windows 10 / 11 x64 |
| Node.js | **>= 20**（推荐 20 LTS 或 22 LTS） |
| 包管理器 | npm（随 Node.js 一并安装） |
| 静态分析引擎 | **semgrep**（见下方安装指引） |

---

## 安装

### 1. 安装项目依赖

```bash
npm install
```

> 依赖 `ssh2`（MIT）用于远程 SSH/SFTP 能力。

### 2. 前提：安装 semgrep 并加入 PATH

Dolphin 的扫描能力基于 [semgrep](https://semgrep.dev)（LGPL-2.1）。**必须先安装 semgrep 并确保其可在命令行中直接调用**：

```bash
pip install semgrep
```

安装完成后验证：

```bash
semgrep --version
```

若能正常输出版本号（如 `1.175.0`），说明安装成功且已加入 PATH。

> **Windows 特别注意**：若 `semgrep --version` 提示"不是内部或外部命令"，说明 Python 的 Scripts 目录未加入 PATH。请先执行 `pip show semgrep` 定位安装路径，然后将对应目录加入系统环境变量 PATH，重启终端后重试。
>
> 若本机未安装 Python，请先到 https://www.python.org/downloads/ 下载安装（安装时勾选 **Add Python to PATH**）。

---

## 核心功能

### 1. 本地扫描（`--local`）

对本机指定目录执行静态安全扫描，输出结构化漏洞清单并存档报告：

```bash
node dolphin-patrol.js --local <目录>
```

示例：

```bash
node dolphin-patrol.js --local D:/your-project/src
```

### 2. 远程巡逻（`--patrol`）

通过 SSH 将扫描命令下发至远程主机执行，回收结果并本地存档——这是"主动巡检"的完整闭环。

**首次使用前需先登记主机**（以 `test-ssh-hosts.js` 为参考模板）：

```javascript
import { createHostStore } from './dolphin-ssh-core.js'
const store = createHostStore()
store.create({
  alias: 'server01',
  host: '192.168.1.10',
  port: 22,
  user: 'ops',
  auth: { kind: 'password', password: '...' },   // 或 { kind: 'key', privateKeyPath: '...' }
  tags: ['prod'],
  environment: 'production',
})
```

然后执行巡逻：

```bash
node dolphin-patrol.js --patrol <alias> <远程目录>
```

示例：

```bash
node dolphin-patrol.js --patrol server01 /srv/app
```

> 远程巡逻会自动完成：连接健康检查 → 探测远端 semgrep → 下发扫描 → 回收 JSON → 结构化映射 → 本地存档。
> 远端未安装 semgrep 时，会自动上传扫描器到远端临时目录执行（fallback 路径）。

### 3. 系统日志与报告生成

所有扫描结果统一映射为 **SecurityFinding** 数据模型，自动存档为 JSON 报告：

```
D:\Dolphin\reports\
├── patrol-local-20260831-223652.json      # 本地扫描报告
├── patrol-server01-20260901-200652.json   # 远程巡逻报告
└── dolphin-report-*.md / *.json           # dolphin-core 生成的报告
```

报告字段：`host` / `file` / `line` / `col` / `severity` / `checkId` / `message` / `remediationHint` / `metadata`。

### 4. 其他入口

```bash
node dolphin-patrol.js                     # 运行自检（25 项断言，无需网络与 semgrep）
node dolphin-core.js --mock [目录]          # 用内置 mock 数据自测完整管线（无需 semgrep）
node dolphin-ssh-core.js                   # SSH 引擎自检（18 项断言）
node test-ssh-hosts.js                     # 测试主机库 + healthcheck 失败路径验证
node test-ssh-hosts.js --live              # 起本地 ssh2 服务端，验证完整巡逻闭环
```

---

## 架构

Dolphin 采用「眼睛 + 手脚 + 大脑」三层架构：

| 层 | 文件 | 职责 |
|---|---|---|
| **扫描层（眼睛）** | `dolphin-core.js` | 基于 Semgrep 的扫描封装，提供统一 SecurityFinding 数据模型 |
| **执行层（手脚）** | `dolphin-ssh-core.js` | 裁剪自 dsh-ssh 的 SSH 引擎，提供 exec / cluster / upload / download / test |
| **融合控制器（大脑）** | `dolphin-patrol.js` | 将扫描命令经 SSH 下发至远程主机，回收 JSON 并结构化存档 |

---

## 开源协议与致谢

| 项目 | 协议 | 用途 |
|---|---|---|
| dsh-code-scan | MIT | Semgrep 扫描能力封装，作为基础扫描模块 |
| dsh-plugin-hos-forge-v2 | MIT | 参考其 MCP 编排思路 |
| dsh-web（dsh-ssh 子包） | Apache-2.0 | 提供 SSH/SFTP 能力，已裁剪为 `dolphin-ssh-core.js` |
| ssh2 | MIT | 底层 SSH 协议库 |
| semgrep | LGPL-2.1 | 开源静态分析引擎 |

本项目自身采用 **MIT** 协议发布。

---

## 相关文档

- [README_EN.md](./README_EN.md) —— **English README**
- [WINDOWS_PREVIEW_GUIDE.md](./WINDOWS_PREVIEW_GUIDE.md) —— **Windows 预览版交付说明（新手请先读这份）**
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) —— 开发日志与踩坑记录
- [docs/SSH_RECON_REPORT.md](./docs/SSH_RECON_REPORT.md) —— dsh-ssh 源码侦察报告与裁剪方案
- [docs/RECON_REPORT.md](./docs/RECON_REPORT.md) —— dsh-code-scan 源码侦察报告

---

## 许可证

本项目采用 [MIT](./LICENSE) 协议发布。请合法、合规、获授权使用。
