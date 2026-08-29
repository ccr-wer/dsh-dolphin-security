/**
 * 配置管理器
 * 
 * 管理 DSH 配置，支持在设置界面配置 API Key
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configPath = path.join(os.homedir(), '.dsh', 'config.json');
    this.config = null;
  }

  /**
   * 获取配置
   */
  async getConfig() {
    if (this.config) {
      return this.config;
    }

    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
    } catch (error) {
      // 配置文件不存在，返回默认配置
      this.config = this.getDefaultConfig();
    }

    return this.config;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      mcp: {
        tools: {
          'web-search': {
            enabled: true,
            provider: 'dsbuiltin'
          },
          'semgrep': {
            enabled: false,
            path: '/usr/local/bin/semgrep'
          },
          'nuclei': {
            enabled: false,
            path: '/usr/local/bin/nuclei'
          },
          'nmap': {
            enabled: false,
            path: '/usr/local/bin/nmap'
          }
        }
      },
      security: {
        defaultStandard: 'owasp',
        autoFix: false,
        reportPath: path.join(os.homedir(), '.dsh', 'reports')
      }
    };
  }

  /**
   * 保存报告
   */
  async saveReport(report, filename) {
    const config = await this.getConfig();
    const reportPath = config.security.reportPath;

    // 确保目录存在
    await fs.mkdir(reportPath, { recursive: true });

    const filePath = path.join(reportPath, filename);
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));

    return filePath;
  }

  /**
   * 获取 API Key（从 DSH 配置）
   */
  async getApiKey(provider) {
    const config = await this.getConfig();

    // 优先使用 DSH 配置的 API Key
    if (config.apiKeys && config.apiKeys[provider]) {
      return config.apiKeys[provider];
    }

    // 回退到环境变量
    const envKey = `${provider.toUpperCase()}_API_KEY`;
    return process.env[envKey];
  }

  /**
   * 检查工具是否启用
   */
  async isToolEnabled(toolName) {
    const config = await this.getConfig();
    return config.mcp?.tools?.[toolName]?.enabled || false;
  }

  /**
   * 获取工具配置
   */
  async getToolConfig(toolName) {
    const config = await this.getConfig();
    return config.mcp?.tools?.[toolName] || {};
  }
}

module.exports = { ConfigManager };