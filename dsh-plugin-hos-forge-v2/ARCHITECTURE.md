# 🏗️ 架构设计：MCP 集成方式

## 🎯 设计理念

### ❌ 传统方式（避免）
```
用户请求 → 插件 → OpenAI API → 用户
          ↓
       消耗用户 API
       重复造轮子
       硬编码 API 调用
```

**问题：**
- 每次调用都消耗用户的 API
- 重复实现联网搜索（已有免费 MCP）
- 硬编码 API Key，不灵活
- 维护成本高

### ✅ MCP 集成方式（推荐）
```
用户请求 → 插件 → MCP 工具编排 → 结果聚合 → 用户
          ↓
       复用现有工具
       集成 HOS 安全引擎
       配置驱动
       免费工具优先
```

**优势：**
- 复用 DSH 内置工具（免费）
- 集成 HOS 安全引擎
- 配置驱动，灵活可扩展
- 维护成本低

## 🔧 核心组件

### 1. MCP 工具编排器 (`MCPToolOrchestrator`)

**职责：**
- 管理和调用 MCP 工具
- 工具发现和配置
- 结果聚合

**关键特性：**
- 复用 DSH 内置工具（web-search, file-system）
- 集成外部安全工具（semgrep, nuclei, nmap）
- 工具启用/禁用配置

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
}
```

### 2. HOS 安全引擎 (`HOSSecurityEngine`)

**职责：**
- 安全分析和漏洞检测
- 风险评估
- 合规性检查
- 修复建议

**关键特性：**
- 基于 S-00-HOS-Sec-Engine
- 支持多种安全标准（OWASP, NIST, PCI）
- 智能漏洞分类

```javascript
class HOSSecurityEngine {
  constructor(configManager) {
    this.configManager = configManager;
    this.standards = {
      owasp: this.loadOWASPStandards(),
      nist: this.loadNISTStandards(),
      pci: this.loadPCIStandards()
    };
  }

  async analyze({ target, scanResults, standard }) {
    const allVulnerabilities = this.aggregateVulnerabilities(scanResults);
    const categorized = this.categorizeVulnerabilities(allVulnerabilities);
    const riskLevel = this.calculateRiskLevel(categorized);
    
    return {
      target,
      vulnerabilities: allVulnerabilities,
      riskLevel,
      recommendations: this.generateRecommendations(categorized)
    };
  }
}
```

### 3. 配置管理器 (`ConfigManager`)

**职责：**
- 管理 DSH 配置
- 工具配置
- API Key 管理（从 DSH 设置界面）

**关键特性：**
- 从 DSH 配置文件读取
- 支持环境变量覆盖
- 工具启用/禁用

```javascript
class ConfigManager {
  async getConfig() {
    // 从 DSH 配置文件读取
    const config = await this.loadDSHConfig();
    
    return {
      mcp: {
        tools: config.mcp?.tools || {}
      },
      security: {
        defaultStandard: 'owasp'
      }
    };
  }

  async getApiKey(provider) {
    // 优先使用 DSH 配置的 API Key
    const config = await this.getConfig();
    return config.apiKeys?.[provider];
  }
}
```

## 📊 工具分类

### 内置工具（免费，不消耗 API）

| 工具 | 描述 | 提供者 |
|------|------|--------|
| web-search | 联网搜索 | DSH 内置 |
| file-system | 文件系统操作 | DSH 内置 |
| code-analysis | 代码分析 | DSH 内置 |

### 外部安全工具

| 工具 | 描述 | 配置 |
|------|------|------|
| semgrep | 静态代码分析 | `p/security-audit` |
| nuclei | 漏洞扫描 | `vulnerabilities` |
| nmap | 网络扫描 | `-sV -sC` |
| sqlmap | SQL 注入测试 | `--batch` |

## 🔄 数据流

### 安全分析流程
```
1. 用户请求分析
   ↓
2. MCP 编排器选择工具
   ↓
3. 并行运行工具（semgrep, nuclei 等）
   ↓
4. HOS 引擎聚合结果
   ↓
5. 漏洞分类和风险评估
   ↓
6. 生成修复建议
   ↓
7. 返回结果给用户
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

## ⚙️ 配置示例

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
# API Key（如果需要）
export OPENAI_API_KEY="your-key"

# 工具路径
export SEMGREP_PATH="/usr/local/bin/semgrep"
export NUCLEI_PATH="/usr/local/bin/nuclei"
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

## 📈 性能优化

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

### API Key 管理
- **配置驱动**：在 DSH 设置界面配置
- **环境变量**：支持环境变量覆盖
- **加密存储**：敏感信息加密存储

### 工具安全
- **沙箱执行**：工具在沙箱中运行
- **权限控制**：最小权限原则
- **审计日志**：记录所有工具调用

## 🎓 总结

### 传统方式 vs MCP 集成方式

| 方面 | 传统方式 | MCP 集成方式 |
|------|----------|--------------|
| API 消耗 | 高（每次调用都消耗） | 低（复用现有工具） |
| 开发成本 | 高（重复造轮子） | 低（集成现有工具） |
| 维护成本 | 高（需要维护 API 调用） | 低（工具独立维护） |
| 灵活性 | 低（硬编码） | 高（配置驱动） |
| 扩展性 | 差（需要修改代码） | 好（添加新工具即可） |

### 关键优势
1. **不重复造轮子**：复用 DSH 已有的 MCP 工具
2. **免费优先**：优先使用免费的内置工具
3. **配置驱动**：在设置界面配置，而不是硬编码
4. **工具编排**：作为 MCP 工具的编排层
5. **集成 HOS**：基于 S-00-HOS-Sec-Engine

---

**这个架构设计避免了传统方式的问题，采用了更现代、更高效的方式。**