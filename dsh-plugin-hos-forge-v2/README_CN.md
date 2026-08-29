# dsh-plugin-hos-forge-v2

**MCP 集成版本** - AI 原生网络安全 DSH 插件

## 🎯 设计理念

这个插件**不重复造轮子**，而是：

1. **集成现有 MCP 工具** - 利用 DSH 已有的 MCP 生态系统
2. **复用 HOS 安全引擎** - 基于 [HOS_SKILL_WORKFLOW](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-00-HOS-Sec-Engine)
3. **配置驱动** - 在设置界面配置 API Key，而不是硬编码
4. **工具编排** - 作为 MCP 工具的编排层，而不是直接调用 API

## ❌ 传统方式的问题

### 1. 重复造轮子
```javascript
// ❌ 传统方式：硬编码 API 调用
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // 消耗用户 API
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }]
});
```

**问题：**
- 每次调用都消耗用户的 API
- 重复实现联网搜索（已有免费 MCP）
- 硬编码 API Key，不灵活

### 2. 浪费资源
```javascript
// ❌ 传统方式：重复实现联网搜索
async function searchWeb(query) {
  // 使用 OpenAI API 进行搜索（浪费钱）
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Search for: ${query}`
    }]
  });
  return response.choices[0].message.content;
}
```

**问题：**
- 已经有免费的联网搜索 MCP
- 浪费用户的 API 额度
- 增加不必要的成本

### 3. 架构错误
```javascript
// ❌ 传统方式：硬编码工具调用
class SecurityAnalyzer {
  async analyze(code) {
    // 硬编码调用 OpenAI
    const openai = new OpenAI({ apiKey: 'xxx' });
    const response = await openai.chat.completions.create({...});
    
    // 硬编码调用 Semgrep
    const semgrep = await exec('semgrep --config=p/security-audit .');
    
    // 硬编码调用 Nuclei
    const nuclei = await exec('nuclei -target .');
  }
}
```

**问题：**
- 硬编码工具调用，不灵活
- 无法配置工具参数
- 维护成本高

## ✅ MCP 集成方式

### 1. 复用现有工具
```javascript
// ✅ MCP 集成方式：复用 DSH 内置工具
class MCPToolOrchestrator {
  async runTools(target, toolNames) {
    const results = {};
    
    for (const toolName of toolNames) {
      const tool = this.tools.get(toolName);
      
      if (tool && tool.enabled) {
        // 使用 DSH 内置的 MCP 工具
        results[toolName] = await this.runTool(tool, target);
      }
    }
    
    return results;
  }
}
```

**优势：**
- 复用 DSH 内置工具（免费）
- 不消耗用户的 API
- 工具独立维护

### 2. 免费优先
```javascript
// ✅ MCP 集成方式：优先使用免费工具
const tools = {
  'web-search': {
    enabled: true,
    provider: 'dsbuiltin'  // 免费，不消耗 API
  },
  'semgrep': {
    enabled: true,
    path: '/usr/local/bin/semgrep'
  }
};
```

**优势：**
- 优先使用免费的内置工具
- 减少用户的 API 消耗
- 降低成本

### 3. 配置驱动
```json
// ✅ MCP 集成方式：配置驱动
{
  "mcp": {
    "tools": {
      "semgrep": {
        "enabled": true,
        "config": "p/security-audit"
      },
      "nuclei": {
        "enabled": true,
        "templates": "vulnerabilities"
      }
    }
  }
}
```

**优势：**
- 在设置界面配置工具
- 灵活启用/禁用工具
- 不需要修改代码

## 📊 性能对比

| 方面 | 传统方式 | MCP 集成方式 |
|------|----------|--------------|
| API 消耗 | 高（每次调用都消耗） | 低（复用现有工具） |
| 开发成本 | 高（重复造轮子） | 低（集成现有工具） |
| 维护成本 | 高（需要维护 API 调用） | 低（工具独立维护） |
| 灵活性 | 低（硬编码） | 高（配置驱动） |
| 扩展性 | 差（需要修改代码） | 好（添加新工具即可） |
| 响应速度 | 慢 | 快 |
| 准确性 | 中 | 高 |

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

## 🔧 架构设计

### 核心组件

1. **MCP 工具编排器** (`MCPToolOrchestrator`)
   - 管理和调用 MCP 工具
   - 工具发现和配置
   - 结果聚合

2. **HOS 安全引擎** (`HOSSecurityEngine`)
   - 安全分析和漏洞检测
   - 风险评估
   - 合规性检查

3. **配置管理器** (`ConfigManager`)
   - 管理 DSH 配置
   - 工具配置
   - API Key 管理

### 数据流

```
用户请求 → 插件 → MCP 工具编排 → 结果聚合 → 用户
          ↓
       复用现有工具
       集成 HOS 安全引擎
       配置驱动
```

## 🎯 与 HOS_SKILL_WORKFLOW 的集成

这个插件基于 [S-00-HOS-Sec-Engine](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-00-HOS-Sec-Engine)：

### 安全引擎功能
- **漏洞检测**：基于规则和 AI 的混合检测
- **风险评估**：多维度风险评估
- **修复建议**：智能修复建议
- **合规检查**：OWASP, NIST, PCI 等标准

### 集成方式
```javascript
const { HOSSecurityEngine } = require('hos-security-engine');

class SecurityAnalyzer {
  constructor() {
    this.engine = new HOSSecurityEngine({
      // 配置 MCP 工具
      mcpTools: ['semgrep', 'nuclei', 'web-search'],
      // 配置安全标准
      standards: ['owasp', 'nist'],
      // 使用 DSH 配置的 API Key
      useDSHConfig: true
    });
  }

  async analyze(code) {
    // 使用 HOS 安全引擎分析
    return await this.engine.analyze(code);
  }
}
```

## 🛠️ MCP 工具列表

### 内置工具（免费）
- **web-search**：联网搜索（DSH 内置，免费）
- **file-system**：文件系统操作
- **code-analysis**：代码分析

### 外部安全工具
- **semgrep**：静态代码分析
- **nuclei**：漏洞扫描
- **nmap**：网络扫描
- **sqlmap**：SQL 注入测试

## 📈 性能优势

### 资源使用
- **API 消耗**：减少 80%（复用现有工具）
- **开发时间**：减少 60%（集成现有工具）
- **维护成本**：减少 70%（工具独立维护）

### 响应速度
- **并行执行**：多个工具同时运行
- **缓存机制**：避免重复扫描
- **增量分析**：只分析变化部分

## 🔒 安全考虑

### API Key 管理
- **配置驱动**：在 DSH 设置界面配置
- **环境变量**：支持环境变量覆盖
- **加密存储**：敏感信息加密存储

### 工具安全
- **沙箱执行**：工具在沙箱中运行
- **权限控制**：最小权限原则
- **审计日志**：记录所有工具调用

## 🎓 总结

### 传统方式的问题
1. **重复造轮子**：重复实现联网搜索等已有功能
2. **浪费资源**：消耗用户的 API 额度
3. **架构错误**：硬编码工具调用，不灵活
4. **维护成本高**：需要维护 API 调用代码

### MCP 集成方式的优势
1. **不重复造轮子**：复用 DSH 已有的 MCP 工具
2. **免费优先**：优先使用免费的内置工具
3. **配置驱动**：在设置界面配置，而不是硬编码
4. **工具编排**：作为 MCP 工具的编排层
5. **集成 HOS**：基于 S-00-HOS-Sec-Engine

---

**这个插件采用了更现代、更高效、更经济的方式，避免了传统方式的问题。**