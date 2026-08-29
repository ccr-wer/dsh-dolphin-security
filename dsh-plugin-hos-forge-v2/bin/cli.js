#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { MCPToolOrchestrator } = require('../src/mcp-orchestrator');
const { HOSSecurityEngine } = require('../src/hos-engine');
const { ConfigManager } = require('../src/config-manager');

const program = new Command();

// 初始化组件
const configManager = new ConfigManager();
const mcpOrchestrator = new MCPToolOrchestrator(configManager);
const hosEngine = new HOSSecurityEngine(configManager);

program
  .name('dsh-hos-forge')
  .description('AI Native Cybersecurity Plugin for DSH CLI - MCP Integrated')
  .version('2.0.0');

// 安全分析命令
program
  .command('analyze')
  .description('Security analysis using MCP tools')
  .argument('<target>', 'Target file or directory')
  .option('-t, --tools <tools>', 'Comma-separated list of tools', 'semgrep,nuclei')
  .option('-s, --standard <standard>', 'Security standard', 'owasp')
  .option('-o, --output <file>', 'Output report file')
  .action(async (target, options) => {
    console.log(chalk.blue('🔍 Starting security analysis...'));
    
    try {
      // 1. 使用 MCP 工具进行扫描
      const tools = options.tools.split(',');
      const scanResults = await mcpOrchestrator.runTools(target, tools);
      
      // 2. 使用 HOS 安全引擎分析
      const analysis = await hosEngine.analyze({
        target,
        scanResults,
        standard: options.standard
      });
      
      // 3. 输出结果
      console.log(chalk.green('✅ Analysis completed!'));
      console.log(chalk.white(`📊 Results:`));
      console.log(chalk.white(`  - Tools used: ${tools.join(', ')}`));
      console.log(chalk.white(`  - Vulnerabilities found: ${analysis.vulnerabilities.length}`));
      console.log(chalk.white(`  - Risk level: ${analysis.riskLevel}`));
      
      if (options.output) {
        await configManager.saveReport(analysis, options.output);
        console.log(chalk.green(`📄 Report saved to ${options.output}`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error.message);
      process.exit(1);
    }
  });

// 漏洞扫描命令
program
  .command('scan')
  .description('Vulnerability scanning')
  .argument('<directory>', 'Directory to scan')
  .option('-t, --type <type>', 'Scan type (quick|full|stealth)', 'full')
  .option('-p, --parallel <num>', 'Parallel scanning threads', '4')
  .action(async (directory, options) => {
    console.log(chalk.blue('🛡️ Starting vulnerability scan...'));
    
    try {
      // 使用 MCP 工具进行扫描
      const tools = ['semgrep', 'nuclei'];
      const results = await mcpOrchestrator.runTools(directory, tools, {
        type: options.type,
        parallel: parseInt(options.parallel)
      });
      
      // 使用 HOS 引擎聚合结果
      const aggregated = await hosEngine.aggregateResults(results);
      
      console.log(chalk.green('✅ Scan completed!'));
      console.log(chalk.white(`📊 Results:`));
      console.log(chalk.white(`  - Files scanned: ${aggregated.filesScanned}`));
      console.log(chalk.white(`  - Vulnerabilities: ${aggregated.vulnerabilities.length}`));
      console.log(chalk.white(`  - Critical: ${aggregated.critical}`));
      console.log(chalk.white(`  - High: ${aggregated.high}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Scan failed:'), error.message);
      process.exit(1);
    }
  });

// 安全审计命令
program
  .command('audit')
  .description('Security audit')
  .argument('[directory]', 'Directory to audit', '.')
  .option('-s, --standard <standard>', 'Security standard', 'owasp')
  .option('--fix', 'Auto-fix vulnerabilities')
  .action(async (directory, options) => {
    console.log(chalk.blue('📋 Starting security audit...'));
    
    try {
      // 1. 使用 MCP 工具进行扫描
      const tools = ['semgrep', 'nuclei', 'nmap'];
      const scanResults = await mcpOrchestrator.runTools(directory, tools);
      
      // 2. 使用 HOS 引擎进行审计
      const audit = await hosEngine.audit({
        directory,
        scanResults,
        standard: options.standard,
        autoFix: options.fix
      });
      
      console.log(chalk.green('✅ Audit completed!'));
      console.log(chalk.white(`📊 Results:`));
      console.log(chalk.white(`  - Standard: ${options.standard.toUpperCase()}`));
      console.log(chalk.white(`  - Vulnerabilities: ${audit.vulnerabilities.length}`));
      console.log(chalk.white(`  - Compliance: ${audit.compliance}%`));
      
      if (options.fix && audit.fixes.length > 0) {
        console.log(chalk.yellow(`🔧 Auto-fix applied: ${audit.fixes.length} fixes`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Audit failed:'), error.message);
      process.exit(1);
    }
  });

// 实时监控命令
program
  .command('monitor')
  .description('Real-time threat monitoring')
  .option('-p, --port <port>', 'Monitoring dashboard port', '3000')
  .option('-i, --interval <seconds>', 'Monitoring interval', '5')
  .action(async (options) => {
    console.log(chalk.blue('🛡️ Starting threat monitor...'));
    
    try {
      // 启动监控
      await hosEngine.startMonitor({
        port: parseInt(options.port),
        interval: parseInt(options.interval)
      });
      
      console.log(chalk.green(`✅ Monitor running on http://localhost:${options.port}`));
      console.log(chalk.gray('Press Ctrl+C to stop'));
      
    } catch (error) {
      console.error(chalk.red('❌ Monitor failed:'), error.message);
      process.exit(1);
    }
  });

// 工具列表命令
program
  .command('tools')
  .description('List available MCP tools')
  .action(async () => {
    console.log(chalk.blue('🔧 Available MCP tools:'));
    
    const tools = await mcpOrchestrator.listTools();
    
    tools.forEach(tool => {
      console.log(chalk.white(`  - ${tool.name}: ${tool.description}`));
    });
  });

// 配置命令
program
  .command('config')
  .description('Show configuration')
  .action(async () => {
    console.log(chalk.blue('⚙️ Current configuration:'));
    
    const config = await configManager.getConfig();
    console.log(chalk.white(JSON.stringify(config, null, 2)));
  });

program.parse();