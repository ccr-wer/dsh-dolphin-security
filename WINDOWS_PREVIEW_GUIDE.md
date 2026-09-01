# Dolphin v0.1.0-beta —— Windows 预览版交付说明

> 这份文档面向**第一次拿到本项目的 Windows 用户**。按顺序做完 4 步即可跑通第一次扫描。
> 全程约 10 分钟（不含下载时间）。

---

## ⚠️ 开始前必读

**本项目为技术研究工具，严禁用于非法渗透测试。**
仅限用于你**拥有合法所有权**、或**已获得明确书面授权**的系统与代码。
**必须获得明确授权方可使用**，使用者自行承担全部法律责任与后果。

---

## 环境要求

| 项目 | 要求 |
|---|---|
| 操作系统 | Windows 10 / 11 x64 |
| Node.js | **20 或更高版本** |
| Python（用于装 semgrep） | 3.9 或更高版本 |
| semgrep | 任意近期版本（如 1.175.0） |

---

## 第 1 步：安装 Node.js 20+

### 下载地址

👉 **https://nodejs.org/zh-cn/download**

### 操作说明

1. 打开上面的网址，下载 **LTS（长期支持版）** —— 页面会自动推荐，按钮通常写着「推荐给多数用户」。
2. **版本务必 >= 20**。如果你装的是 18.x 或更低，Dolphin 会拒绝运行，请卸载后重装 20 LTS 或 22 LTS。
3. 双击安装包，一路「Next」即可。**关键：安装向导里务必勾选 "Add to PATH"（添加到环境变量）**，默认就是勾选的，不要取消。
4. 安装完成后，**重新打开一个**「命令提示符」或「PowerShell」窗口（重要：已打开的旧窗口不认新装的 Node）。

### 验证

```bash
node --version
npm --version
```

能看到两行版本号（如 `v22.22.2` 和 `10.9.0`）即表示成功。

> 若提示「'node' 不是内部或外部命令」，说明 PATH 没生效：请重启电脑后重试；仍不行则需手动把 Node 安装目录（默认 `C:\Program Files\nodejs\`）加入系统环境变量 PATH。

---

## 第 2 步：安装 Semgrep

Dolphin 的扫描引擎是 [Semgrep](https://semgrep.dev)，它通过 Python 的 pip 分发。

### 2.1 先确认 Python 可用

```bash
python --version
```

若能看到 `Python 3.x.x` 说明已安装，跳到 2.2。
若提示找不到命令，请先到 👉 **https://www.python.org/downloads/** 下载安装，**安装时务必勾选 "Add Python to PATH"**。

### 2.2 安装 Semgrep

```bash
pip install semgrep
```

### 2.3 验证

```bash
semgrep --version
```

能看到版本号（如 `1.175.0`）即成功。

### 常见问题：提示「'semgrep' 不是内部或外部命令」

这是 Windows 上最常见的问题，说明 Python 的 Scripts 目录没进 PATH。解决办法：

```bash
pip show semgrep
```

在输出里找到 `Location:` 一行（形如 `c:\users\你的用户名\appdata\local\programs\python\python311\lib\site-packages`），
把它末尾的 `lib\site-packages` 换成 `Scripts`，得到形如
`c:\users\你的用户名\appdata\local\programs\python\python311\Scripts` 的路径，
把它加入系统环境变量 PATH，**重启终端**后重跑 `semgrep --version` 验证。

### 官方文档

👉 **https://semgrep.dev/docs/getting-started/**

---

## 第 3 步：安装项目依赖

打开终端，**进入项目目录**：

```bash
cd D:\Dolphin
```

执行安装：

```bash
npm install
```

这一步会装 `ssh2`（远程 SSH/SFTP 能力，MIT 协议）及其依赖，通常 1 分钟内完成。

> 安装完成后会生成 `node_modules` 文件夹和 `package-lock.json`，这都属于正常产物，已在 `.gitignore` 中排除，不会被误提交。

### 快速自检（可选但推荐）

```bash
node dolphin-patrol.js
```

会跑 25 项自检断言，输出应为「25 通过 / 0 失败」。这一步**不需要** semgrep 和网络。

---

## 第 4 步：运行本地扫描

```bash
node dolphin-patrol.js --local <目录>
```

把 `<目录>` 换成你想扫描的**本地文件夹路径**。例如：

```bash
node dolphin-patrol.js --local D:\MyProject\src
```

也可以拿项目自带的测试靶场练手（该目录已内置若干故意留下的漏洞样例）：

```bash
node dolphin-patrol.js --local D:\Dolphin_Testbed\vulnerable_app
```

### 运行期间

终端会打印扫描进度。首次运行 semgrep 需要下载规则集，可能稍慢（几十秒到几分钟），属正常现象。
**请耐心等待，不要中途关闭窗口。**

### 完成后你会看到

```
[Dolphin] 巡逻完成：共 N 处（ERROR x / WARNING y / INFO z）
[Dolphin] 报告：D:\Dolphin\reports\patrol-local-20260901-210000.json
```

---

## 第 5 步：查看扫描结果

**运行完命令后，扫描结果会保存在 `D:\Dolphin\reports\*.json` 中。
建议使用 VS Code 或 Chrome 浏览器打开查看 JSON，或者用鼠标右键选择"用记事本打开"。**

具体操作：

1. 打开「文件资源管理器」，进入 `D:\Dolphin\reports\` 目录。
2. 找到刚刚生成的 `.json` 文件（文件名形如 `patrol-local-20260901-210000.json`，中间的日期时间是生成时刻）。
3. **推荐方式**：在该文件上**鼠标右键 → 打开方式 → 选择「Visual Studio Code」或「Google Chrome」**。
   - 用 **VS Code** 打开：有语法高亮和折叠，最易读。
   - 用 **Chrome** 打开：浏览器会自动格式化 JSON，支持点开/收起每一层。
4. **兜底方式**：鼠标**右键 → 打开方式 → 记事本**也能查看，只是没有高亮，长行不便阅读。

### 报告内容说明

每个漏洞条目（SecurityFinding）包含这些字段：

| 字段 | 含义 |
|---|---|
| `host` | 来源主机别名（本地扫描为 `local`） |
| `file` | 存在问题的文件路径 |
| `line` / `col` | 问题所在的行号 / 列号 |
| `severity` | 严重程度：`ERROR` / `WARNING` / `INFO` |
| `checkId` | Semgrep 规则 ID（可用于查规则详情） |
| `message` | 问题描述 |
| `remediationHint` | 修复建议 |
| `metadata` | 附加信息（如 CWE 编号、参考链接） |

报告顶部的 `summary` 字段给出各严重级别的数量统计，可以先看它快速判断风险概貌。

---

## 进阶：远程巡逻（可选）

如果你要对**远程服务器**做巡检，需要先登记主机，再执行巡逻：

```bash
node dolphin-patrol.js --patrol <主机别名> <远程目录>
```

示例：

```bash
node dolphin-patrol.js --patrol server01 /srv/app
```

> 如何登记主机：请参考 `test-ssh-hosts.js`，它是一份可直接改的模板。
> **再次强调：仅可对已获得明确授权的主机执行远程巡逻。**

---

## 常见问题速查

| 现象 | 原因与解决 |
|---|---|
| `'node' 不是内部或外部命令` | Node 未装或 PATH 未生效 → 重做第 1 步，重启终端 |
| `'semgrep' 不是内部或外部命令` | Python Scripts 目录未进 PATH → 见第 2 步「常见问题」 |
| 报 `Node version too low` 之类 | Node 版本 < 20 → 升级到 20 LTS 或 22 LTS |
| 扫描卡在「Loading rules」很久 | 首次需下载规则集，耐心等待；若超过 10 分钟请检查网络 |
| 报告里 `codeSnippet` 显示 `requires login` | Semgrep 未登录 registry，**不影响漏洞检出**（file/line/checkId/message 均正常）；如需代码片段可执行 `semgrep login` |
| `npm install` 报网络错误 | 检查网络；可尝试 `npm install --registry=https://registry.npmmirror.com` |

---

## 相关文档

- [README.md](./README.md) —— 项目首页与完整功能说明
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) —— 开发日志与踩坑记录
- [SSH_RECON_REPORT.md](./SSH_RECON_REPORT.md) —— dsh-ssh 源码侦察报告与裁剪方案

---

**Dolphin v0.1.0-beta（Windows 预览版）** · 采用 MIT 协议发布 · 请合法、合规、获授权使用。
