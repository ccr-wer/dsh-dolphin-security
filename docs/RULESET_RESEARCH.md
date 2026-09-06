# Dolphin 扫描精准度专项研究报告 —— Semgrep 规则集选型与补强方案

> 研究日期：2026-09-06　·　实验环境：semgrep 1.175.0（Windows x64）　·　靶场：vulnerable_app（Flask app.py + config.py + Node server.js，故意埋设 14+ 处真实漏洞模式）
> 本报告为选型研究文档，所有数据均为同靶场同条件实测。

---

## 一、结论速览（TL;DR）

1. 当前默认的 `p/security-audit` 存在**严重覆盖空白**：对 CWE-79（XSS）、CWE-89（SQL 注入）、CWE-22（路径穿越）、CWE-95（eval 注入）**全部漏报**——靶场里 2 处 SQL 拼接、3 处 XSS、1 处路径穿越它一个都抓不到。
2. **最推荐的搭配**：`p/security-audit + p/owasp-top-ten` 双包叠加（5 秒、唯一命中 14 条、全部为真漏洞）。省时省钱、几乎零噪音。
3. **必须自建规则**：硬编码凭据（CWE-798）检测在所有官方社区包中**全部失效**（规则 `hardcoded-password-default` 已从 registry 消失），需自建 1 条 YAML 规则或结合确定性正则补位。
4. `p/default` 覆盖最全（27 条命中，含 7 条深层污点 SQL 分析）但噪音大，适合低频深扫而非日常巡逻。

---

## 二、实测矩阵（同一靶场、同一条件）

| 规则集 | 命中 | 耗时 | 覆盖的 CWE（实测命中） | 备注 |
|---|---|---|---|---|
| `p/security-audit`（现默认） | 4 | 5s | CWE-78 ×3、CWE-489 ×1 | **CWE-79/89/22/95 全漏** |
| `p/owasp-top-ten` | 11 | 5s | CWE-89 ×2、CWE-79 ×3、CWE-22 ×1、CWE-95 ×1、CWE-704 ×3、CWE-489 ×1 | 性价比最高；但**不含** child_process 检测 |
| `p/cwe-top-25` | 6 | 5s | CWE-89 ×2、CWE-79 ×3、CWE-22 ×1 | owasp 的真漏洞子集 |
| `p/xss` | 3 | 3s | CWE-79 ×3 | 专项 |
| `p/sql-injection` | 2 | 5s | CWE-89 ×2 | 浅层（污点版在 default 里） |
| `p/command-injection` | 0 | 5s | — | 靶场模式不匹配其规则形态 |
| `p/secrets` | 0 | 3s | — | 社区版对硬编码凭据形同虚设 |
| `p/flask` | 4 | 4s | 同 security-audit | 子集，无增量 |
| `p/nodejs` | 5 | 5s | | |
| `p/default` | 27 | 9s | 含 7 条深层污点 CWE-89、CWE-915 ×3、CWE-352 等 | 最全但需去噪 |

**p/security-audit 的空白清单**（对照靶场真值）：CWE-79、CWE-89、CWE-22、CWE-95、CWE-798（硬编码凭据）。用户关注的 CWE-79 与 CWE-89 确认为空白，实测坐实。

## 三、邻近项目技术分析：dsh-code-security@0.3.2

`dsh-code-security`（DSH 生态姊妹插件）采用与 semgrep 完全不同的技术路线——**48 条语言感知的确定性正则规则**（SEC-001～SEC-4xx），零运行时依赖：

- **规则包构成**（按 CWE 分布）：CWE-78 命令注入 ×8、CWE-502 反序列化 ×5、CWE-798 硬编码凭据 ×4、CWE-22 路径穿越 ×3、CWE-95/89/79/918/693/327/295 各 ×2，另有 942/732/601/532/347/330/328/321/312/209/1104/250 各 ×1，合计 **23 类 CWE**。
- **评价标准**：四级严重度（critical 9 / high 28 / medium 6 / low 5）+ 三档置信度（high 23 / medium 24 / low 1），"每条规则只报告事实模式，不含修复建议"——低误报导向的设计。
- **同靶场对比实测**（按语言过滤后）：命中 9 条，其中 **3 条硬编码凭据（config.py 密码×1、令牌×2）是所有 semgrep 官方包的漏报增量**；eval 动态执行 ×3 也快于官方污点分析。
- **它的弱点（客观记录）**：SEC-301 对 JSON 冒号引号风格（`"password": "..."`，`password` 与 `:` 之间隔引号）存在漏报；纯正则无污点传播，无法区分"拼接进了 SQL"与"只是字符串里有 SQL 字样"的上下文。

**互补性结论**：semgrep 规则集强在污点传播与框架语义（XSS/SQLi/路径穿越），dsh-code-security 强在凭据泄露与语言无关的事实模式。两者并集才是完整防线。

## 四、可自定义规则清单（建议落地）

### A. 新增自建规则（补官方空白，优先级从高到低）

1. **hardcoded-credentials（CWE-798）** —— 最高优先级。借 dsh-code-security SEC-301/302 思路并修复其 JSON 风格漏报：

```yaml
rules:
  - id: dolphin.hardcoded-credentials
    message: 疑似硬编码凭据（密码/令牌/密钥），应改用环境变量或密钥管理服务
    severity: ERROR
    languages: [js, python, ts]
    metadata:
      cwe: [CWE-798]
      confidence: MEDIUM
    patterns:
      - pattern-regex: (?i)["']?(?:password|passwd|pwd|secret(?:_key)?|api_?key|access_?key|auth_?token)["']?\s*[:=]\s*["'][^"']{4,}["']
```

2. **jwt-none-alg（CWE-347）**、**tls-verify-disabled（CWE-295）**、**ecb-mode（CWE-327）**：参考 SEC-204/205/202 的正则转写为 semgrep 规则，官方包对这些场景覆盖不稳定。

3. **shell-pipe-download-exec（CWE-78）**：`curl … | sh` 类模式（SEC-006），CI 脚本与 Dockerfile 高发。

### B. 官方规则集搭配方案（按场景）

| 方案 | 搭配 | 命中（靶场） | 耗时 | 适用 |
|---|---|---|---|---|
| **日常巡逻（推荐默认）** | `p/security-audit` + `p/owasp-top-ten` + 自建 hardcoded-credentials | 14+3 | ≈6s | 高频巡逻的最优性价比 |
| **低频深扫** | `p/default` + 自建规则 | 27+3 | ≈10s | 每周/发版前 |
| **专项抽查** | `p/xss` / `p/sql-injection` / `p/cwe-top-25` 单选 | 2–6 | 3–5s | 按需定向 |

### C. 成本与易用性评估

- **费用**：semgrep 社区 registry 的全部 `p/*` 规则集均免费；成本只体现在**扫描时长与噪音处理**上。
- **最省钱易用**：方案 A（双包 + 1 条自建规则）。理由：① 5 秒级耗时与现状持平；② 靶场上去重后 17 条命中**全部为真漏洞、零误报**；③ 规则增量对 `--config` 透明，Dolphin 的 `rulesConfig` 参数原生支持多包叠加（`--config` 可重复传）。
- **噪音成本**：`p/default` 独有命中里 CWE-915/352 等在真实项目里误报率偏高，不建议进日常巡逻默认配置。
- **落地方式**：把 `dolphin-patrol.js` 的 `DEFAULT_RULES` 从 `'p/security-audit'` 调整为 `'p/security-audit p/owasp-top-ten'`（或经 `--rules-config` 传入），自建规则存 `rules/dolphin-core.yml` 随仓库分发。

## 五、遗留问题

1. `p/secrets` 社区版对明文凭据几乎无效——若需强 secret 扫描，评估 gitleaks/trufflehog 集成或 semgrep 官方 Secrets 平台（付费）。
2. `hardcoded-password-default` 规则从 registry 消失的原因未查证（上游重命名或下架），自建规则是稳定对策。
3. dsh-code-security 的 JSON 风格键漏报（SEC-301）已反馈价值点，其正则可按本报告 §四-A-1 的写法修复。

---

*研究者：Dolphin 项目组　·　数据可复现：`semgrep scan --config p/<ruleset> --json --metrics=off D:/Dolphin_Testbed/vulnerable_app`*
