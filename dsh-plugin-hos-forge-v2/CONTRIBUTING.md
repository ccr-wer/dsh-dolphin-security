# 贡献指南

感谢你对 dsh-plugin-hos-forge-v2 的兴趣！

## 🎯 设计原则

这个插件遵循以下设计原则：

1. **不重复造轮子**：复用 DSH 已有的 MCP 工具
2. **免费优先**：优先使用免费的内置工具
3. **配置驱动**：在设置界面配置，而不是硬编码
4. **工具编排**：作为 MCP 工具的编排层

## 🚀 如何贡献

### 1. 添加新的 MCP 工具

```javascript
// src/mcp-orchestrator.js
async initializeTools() {
  // 添加新工具
  this.tools.set('new-tool', {
    name: 'new-tool',
    description: 'New security tool',
    enabled: false,  // 默认禁用
    path: '/usr/local/bin/new-tool'
  });
}
```

### 2. 添加新的安全标准

```javascript
// src/hos-engine.js
loadNewStandards() {
  return {
    name: 'New Standard',
    categories: ['Category 1', 'Category 2', 'Category 3']
  };
}
```

### 3. 改进漏洞检测

```javascript
// src/hos-engine.js
categorizeVulnerabilities(vulnerabilities, standard) {
  // 改进分类逻辑
}
```

## 📝 代码规范

### 1. 不硬编码 API 调用
```javascript
// ❌ 避免
const openai = new OpenAI({ apiKey: 'xxx' });

// ✅ 推荐
const mcpClient = new MCPClient();
await mcpClient.call('web-search', { query: '...' });
```

### 2. 使用配置驱动
```javascript
// ❌ 避免
const tool = 'semgrep';

// ✅ 推荐
const config = await this.configManager.getConfig();
const tool = config.mcp.tools['semgrep'];
```

### 3. 优先使用免费工具
```javascript
// ❌ 避免
const results = await openai.chat.completions.create({...});

// ✅ 推荐
const results = await mcpClient.call('web-search', {...});
```

## 🧪 测试

```bash
npm test
```

## 📚 文档

- [架构设计](ARCHITECTURE.md)
- [对比分析](COMPARISON.md)
- [README](README.md)

## 🤝 社区

- [GitHub Issues](https://github.com/your-username/dsh-plugin-hos-forge-v2/issues)
- [讨论区](https://github.com/your-username/dsh-plugin-hos-forge-v2/discussions)

## 📄 许可证

MIT License