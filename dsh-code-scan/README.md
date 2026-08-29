# dsh-code-scan

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的 Agent 增加 `code_scan` 工具：对指定目录运行 [semgrep](https://semgrep.dev) 代码安全扫描，输出按文件、行号、严重级别分组的中文 Markdown 报告。

## 功能

- 单个工具 `code_scan`，传入目录路径即可扫描。
- 报告按文件分组，含行号和严重级别（ERROR / WARNING / INFO）。
- 结果按严重级别优先排序，默认最多显示 200 条，避免撑爆 Agent 上下文。
- 未安装 semgrep 时返回友好的中文提示，不会崩溃。

## 安装前提

本机需安装 semgrep，并保证 `semgrep` 命令在 PATH 上。Windows 建议用独立虚拟环境安装，避免污染其他 Python 环境：

```powershell
python -m venv C:\Users\<你>\semgrep-venv
C:\Users\<你>\semgrep-venv\Scripts\pip install semgrep
# 把 C:\Users\<你>\semgrep-venv\Scripts 加入用户 PATH
```

## 安装插件

```sh
dsh plugin --profile web add dsh-code-scan
```

安装完成后重启 dsh web 生效。

## 使用

在 DSH 对话中让 Agent 扫描某个目录，例如：

> 用 code_scan 工具扫描 C:\path\to\your\project

报告示例：

```markdown
# semgrep 扫描报告

- 扫描目录：`C:\...\demo`
- 发现问题：共 4 处（ERROR 2 / WARNING 2 / INFO 0）

## C:\...\app.py（2 处）

- [ERROR] 第 8 行 · 规则 `...sqlalchemy-execute-raw-query`：Avoiding SQL string concatenation...
- [WARNING] 第 18 行 · 规则 `...eval-detected`：Detected the use of eval()...
```

## 工作原理

1. 调用 `semgrep scan --json <目录>`。
2. 解析 JSON，提取文件、行号、严重级别、规则 id、描述。
3. 按严重级别优先排序，并截断到上限条数。
4. 生成中文 Markdown 报告返回给 Agent。

## License

[MIT](./LICENSE)
