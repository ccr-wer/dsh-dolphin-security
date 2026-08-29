// dsh-code-scan 插件入口：向 Agent 注册 code_scan 工具。

import { defineTool } from '@deepseek-ai/dsh-tools'
import { isAbsolute, resolve } from 'node:path'
import { scanDirectory } from './lib/scanner.js'

export const name = 'code-scan'

// 依赖 tools 服务：Cordis 会等 tools 就绪后再调用 apply
export const inject = ['tools']

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'code_scan',
    description: '对指定目录运行 semgrep 代码安全扫描，返回按文件分组、含行号和严重级别的中文报告。',
    parameters: {
      path: {
        type: 'string',
        required: true,
        description: '要扫描的目录路径（绝对路径，或相对于会话工作目录的相对路径）。',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args, exec) {
      // 相对路径 → 基于会话工作目录解析成绝对路径
      const cwd = exec.agent?.session?.header?.cwd ?? process.cwd()
      const target = isAbsolute(args.path) ? args.path : resolve(cwd, args.path)

      const result = await scanDirectory(target)
      return result.ok ? result.text : result.message
    },
  }))
}
