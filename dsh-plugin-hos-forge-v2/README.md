# dsh-plugin-hos-forge-v2

AI Native Cybersecurity Plugin for DSH CLI - MCP Integrated Version

## 🎯 设计理念

这个插件**不重复造轮子**，而是：

1. **集成现有 MCP 工具** — 利用 DSH 已有的 MCP 生态系统
2. **复用 HOS 安全引擎** — 基于 [HOS_SKILL_WORKFLOW](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-00-HOS-Sec-Engine)
3. **配置驱动** — 在设置界面配置 API Key，而不是硬编码
4. **工具编排** — 作为 MCP 工具的编排层，而不是直接调用 API

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| MCP 工具编排 | 复用 DSH 内置工具（web-search 等免费工具） |
| HOS 安全引擎 | 基于 S-00-HOS-Sec-Engine 的安全分析 |
| 配置驱动 | 在 DSH 设置界面配置，灵活启用/禁用工具 |
| 多工具集成 | Semgrep、Nuclei、Nmap、SQLMap 等 |

## 🚀 安装

```bash
npm install -g dsh-plugin-hos-forge-v2
```

## 📖 使用

### CLI 命令

```bash
# 安全分析（使用 MCP 工具）
dsh hos-forge analyze ./src --tools semgrep,nuclei

# 漏洞扫描
dsh hos-forge scan ./project --type full

# 安全审计
dsh hos-forge audit ./codebase --standard owasp

# 实时监控
dsh hos-forge monitor --port 3000

# 查看可用工具
dsh hos-forge tools

# 查看配置
dsh hos-forge config
```

### MCP 工具配置

在 DSH 设置界面配置：

```json
{
  "mcp": {
    "tools": {
      "semgrep": {
        "enabled": true,
        "path": "/usr/local/bin/semgrep"
      },
      "nuclei": {
        "enabled": true,
        "path": "/usr/local/bin/nuclei"
      },
      "web-search": {
        "enabled": true,
        "provider": "dsbuiltin"
      }
    }
  }
}
```

## 🏗️ 架构

```
用户请求 → CLI → MCP 工具编排器 → MCP 工具（免费） → 结果聚合 → HOS 安全引擎 → 返回结果
```

**核心组件：**
- `MCPToolOrchestrator` — 管理和调用 MCP 工具
- `HOSSecurityEngine` — 安全分析引擎
- `ConfigManager` — 配置管理

## 📚 文档

- [架构设计](ARCHITECTURE.md) — 系统架构详解
- [MCP 集成指南](MCP_INTEGRATION.md) — MCP 工具集成说明
- [对比分析](COMPARISON.md) — 传统方式 vs MCP 方式
- [贡献指南](CONTRIBUTING.md) — 如何参与贡献

## 📄 许可证

MIT License

---

**Made with ❤️ by the HOS Team**