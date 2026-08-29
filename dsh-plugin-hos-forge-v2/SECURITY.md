# 安全政策

## 支持的版本

| 版本 | 支持状态 |
| ------ | -------- |
| 2.0.x | ✅ 支持 |
| 1.0.x | ❌ 不支持 |

## 报告漏洞

如果你发现安全漏洞，请通过以下方式报告：

1. **不要**创建公开的 GitHub Issue
2. 发送邮件到 [security@example.com]
3. 提供详细的漏洞描述
4. 我们会在 48 小时内回复

## 安全考虑

### API Key 管理
- **配置驱动**：在 DSH 设置界面配置
- **环境变量**：支持环境变量覆盖
- **加密存储**：敏感信息加密存储

### 工具安全
- **沙箱执行**：工具在沙箱中运行
- **权限控制**：最小权限原则
- **审计日志**：记录所有工具调用

### MCP 工具安全
- **工具验证**：验证工具来源
- **权限检查**：检查工具权限
- **安全扫描**：定期扫描工具漏洞

## 安全最佳实践

### 1. 配置安全
```json
{
  "mcp": {
    "tools": {
      "semgrep": {
        "enabled": true,
        "path": "/usr/local/bin/semgrep"
      }
    }
  }
}
```

### 2. 环境变量
```bash
# 不要在代码中硬编码 API Key
export OPENAI_API_KEY="your-key"
```

### 3. 工具权限
```bash
# 限制工具权限
chmod 755 /usr/local/bin/semgrep
chmod 755 /usr/local/bin/nuclei
```

## 安全审计

### 定期审计
- **工具扫描**：定期扫描工具漏洞
- **配置检查**：检查配置安全性
- **权限审查**：审查工具权限

### 审计日志
```json
{
  "timestamp": "2026-08-21T05:13:00.000Z",
  "tool": "semgrep",
  "action": "scan",
  "target": "./src",
  "result": "success"
}
```

## 安全更新

### 更新策略
- **安全补丁**：立即发布
- **功能更新**：定期发布
- **重大更新**：提前通知

### 更新通知
- **GitHub Releases**：发布更新通知
- **邮件通知**：订阅安全公告
- **社区讨论**：参与安全讨论

## 安全资源

### 官方文档
- [DSH 安全文档](https://dsh.deepseek.com/security)
- [MCP 安全指南](https://dsh.deepseek.com/mcp/security)
- [HOS 安全引擎](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-00-HOS-Sec-Engine)

### 安全工具
- [Semgrep 安全](https://semgrep.dev/docs/security)
- [Nuclei 安全](https://nuclei.projectdiscovery.io/security)
- [Nmap 安全](https://nmap.org/book/man-security.html)

### 社区资源
- [OWASP](https://owasp.org)
- [NIST](https://www.nist.gov)
- [CVE](https://cve.mitre.org)

## 安全联系

### 安全团队
- **邮箱**：[security@example.com]
- **GitHub**：[@security-team]
- **Discord**：[#security-channel]

### 响应时间
- **严重漏洞**：24 小时内响应
- **高危漏洞**：48 小时内响应
- **中危漏洞**：1 周内响应
- **低危漏洞**：2 周内响应

## 安全承诺

我们承诺：
1. **及时响应**：及时响应安全报告
2. **透明公开**：公开安全更新信息
3. **持续改进**：持续改进安全措施
4. **社区协作**：与社区协作解决安全问题

---

**感谢你帮助我们保持项目的安全！**