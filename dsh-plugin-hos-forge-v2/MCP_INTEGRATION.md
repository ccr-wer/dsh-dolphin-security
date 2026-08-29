# 🔧 MCP 集成指南

## 🎯 什么是 MCP？

MCP（Model Context Protocol）是 DSH 的工具协议，允许 AI 模型调用外部工具。

### MCP 的优势
1. **标准化**：统一的工具调用接口
2. **可扩展**：易于添加新工具
3. **安全**：工具在沙箱中运行
4. **免费**：内置工具免费使用

## 🛠️ DSH 内置 MCP 工具

### 1. web-search（联网搜索）
- **描述**：联网搜索信息
- **提供者**：DSH 内置
- **费用**：免费
- **使用场景**：搜索最新安全漏洞、技术文档等

```javascript
// 使用示例
const results = await mcpClient.call('web-search', {
  query: 'latest security vulnerabilities'
});
```

### 2. file-system（文件系统）
- **描述**：文件系统操作
- **提供者**：DSH 内置
- **费用**：免费
- **使用场景**：读取、写入、搜索文件

```javascript
// 使用示例
const content = await mcpClient.call('file-system', {
  action: 'read',
  path: './src/index.js'
});
```

### 3. code-analysis（代码分析）
- **描述**：代码分析
- **提供者**：DSH 内置
- **费用**：免费
- **使用场景**：代码质量检查、漏洞检测

```javascript
// 使用示例
const analysis = await mcpClient.call('code-analysis', {
  code: sourceCode,
  language: 'javascript'
});
```

## 🔌 外部 MCP 工具

### 1. Semgrep（静态代码分析）
- **描述**：静态代码分析工具
- **安装**：`pip install semgrep`
- **配置**：`p/security-audit`

```json
{
  "mcp": {
    "tools": {
      "semgrep": {
        "enabled": true,
        "path": "/usr/local/bin/semgrep",
        "config": "p/security-audit"
      }
    }
  }
}
```

### 2. Nuclei（漏洞扫描）
- **描述**：基于模板的漏洞扫描器
- **安装**：`go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest`
- **配置**：`vulnerabilities`

```json
{
  "mcp": {
    "tools": {
      "nuclei": {
        "enabled": true,
        "path": "/usr/local/bin/nuclei",
        "templates": "vulnerabilities"
      }
    }
  }
}
```

### 3. Nmap（网络扫描）
- **描述**：网络发现和安全审计工具
- **安装**：`apt-get install nmap`
- **配置**：`-sV -sC`

```json
{
  "mcp": {
    "tools": {
      "nmap": {
        "enabled": true,
        "path": "/usr/local/bin/nmap"
      }
    }
  }
}
```

### 4. SQLMap（SQL 注入测试）
- **描述**：SQL 注入和数据库接管工具
- **安装**：`pip install sqlmap`
- **配置**：`--batch`

```json
{
  "mcp": {
    "tools": {
      "sqlmap": {
        "enabled": true,
        "path": "/usr/local/bin/sqlmap"
      }
    }
  }
}
```

## 🔧 MCP 工具编排

### 编排器架构
```javascript
class MCPToolOrchestrator {
  constructor(configManager) {
    this.configManager = configManager;
    this.tools = new Map();
  }

  async runTools(target, toolNames) {
    const results = {};

    for (const toolName of toolNames) {
      const tool = this.tools.get(toolName);

      if (tool && tool.enabled) {
        results[toolName] = await this.runTool(tool, target);
      }
    }

    return results;
  }

  async runTool(tool, target) {
    // 根据工具类型调用不同的 MCP 方法
    switch (tool.name) {
      case 'web-search':
        return await this.runWebSearch(target);
      case 'semgrep':
        return await this.runSemgrep(target);
      case 'nuclei':
        return await this.runNuclei(target);
      default:
        throw new Error(`Unknown tool: ${tool.name}`);
    }
  }
}
```

### 工具调用流程
```
1. 读取配置（哪些工具启用）
   ↓
2. 检查工具可用性
   ↓
3. 准备工具参数
   ↓
4. 调用 MCP 工具
   ↓
5. 收集和聚合结果
   ↓
6. 错误处理和重试
```

## ⚙️ 配置管理

### DSH 设置界面配置
```json
{
  "mcp": {
    "tools": {
      "web-search": {
        "enabled": true,
        "provider": "dsbuiltin"
      },
      "semgrep": {
        "enabled": true,
        "path": "/usr/local/bin/semgrep",
        "config": "p/security-audit"
      },
      "nuclei": {
        "enabled": true,
        "path": "/usr/local/bin/nuclei",
        "templates": "vulnerabilities"
      }
    }
  },
  "security": {
    "defaultStandard": "owasp",
    "autoFix": false,
    "reportPath": "~/.dsh/reports"
  }
}
```

### 环境变量覆盖
```bash
# 工具路径
export SEMGREP_PATH="/usr/local/bin/semgrep"
export NUCLEI_PATH="/usr/local/bin/nuclei"

# API Key（如果需要）
export OPENAI_API_KEY="your-key"
```

## 🎯 与 HOS_SKILL_WORKFLOW 的集成

### S-00-HOS-Sec-Engine 集成
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

## 📊 性能优化

### 并行执行
```javascript
// 并行运行多个工具
const results = await Promise.all([
  this.runTool('semgrep', target),
  this.runTool('nuclei', target),
  this.runTool('nmap', target)
]);
```

### 缓存机制
```javascript
// 缓存扫描结果
const cacheKey = `${target}:${tools.join(',')}`;
if (this.cache.has(cacheKey)) {
  return this.cache.get(cacheKey);
}

const results = await this.runTools(target, tools);
this.cache.set(cacheKey, results);
```

### 增量分析
```javascript
// 只分析变化的文件
const changedFiles = await this.getChangedFiles();
if (changedFiles.length > 0) {
  await this.analyze(changedFiles);
}
```

## 🔒 安全考虑

### 工具安全
- **沙箱执行**：工具在沙箱中运行
- **权限控制**：最小权限原则
- **审计日志**：记录所有工具调用

### 配置安全
- **加密存储**：敏感信息加密存储
- **环境变量**：支持环境变量覆盖
- **配置验证**：验证配置有效性

## 🎓 总结

### MCP 集成的优势
1. **标准化**：统一的工具调用接口
2. **可扩展**：易于添加新工具
3. **安全**：工具在沙箱中运行
4. **免费**：内置工具免费使用
5. **配置驱动**：通过配置控制行为

### 与传统方式的对比
| 方面 | 传统方式 | MCP 集成方式 |
|------|----------|--------------|
| API 消耗 | 高 | 低（免费） |
| 开发成本 | 高 | 低 |
| 维护成本 | 高 | 低 |
| 灵活性 | 低 | 高 |
| 扩展性 | 差 | 好 |

---

**MCP 集成是更现代、更高效、更经济的方式。**