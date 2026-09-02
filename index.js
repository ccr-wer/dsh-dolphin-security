// dsh-dolphin-security 插件入口（Cordis 宿主侧适配层）。
// ---------------------------------------------------------------------------
// 定位：纯功能型插件 —— 只向 Agent 注册 dolphin_scan / dolphin_patrol 两个工具，
// 不含任何 UI / client 半区（无 dsh.client、无侧边栏、无设置面板）。
//
// 架构约定（与 D:\Dolphin\docs\DSH_UI_RECON_REPORT.md 第六节一致）：
//   - 本文件是唯一依赖 Cordis 运行时的地方；
//   - dolphin-patrol.js / dolphin-core.js / dolphin-ssh-core.js 保持零 DSH 依赖，
//     既可被本适配层调用，也可被外部脚本直接 import（双形态并存）；
//   - 工具逻辑全部委托给 dolphin-patrol.js，本层不做任何扫描/SSH 实现。
// ---------------------------------------------------------------------------

import { defineTool } from '@deepseek-ai/dsh-tools'
import { isAbsolute, resolve } from 'node:path'
import { runLocalScan, runPatrol } from './dolphin-patrol.js'

// 与 cordis.patch.yml 的 insert[].id 对齐：dsh 按该 id 在配置树中挂载本插件。
export const name = 'dolphin'

// 依赖 tools 服务：Cordis 会等 tools 就绪后再调用 apply。
export const inject = ['tools']

// ---------------------------------------------------------------------------
// 渲染与路径辅助
// ---------------------------------------------------------------------------

// 宿主约定：output.render 返回 ContentBlock 数组，文本块用 { type: 'text' }。
const renderText = (_args, value) => [{ type: 'text', text: String(value) }]

// 相对路径 → 基于会话工作目录解析成绝对路径（与 dsh-code-scan 惯例一致）。
function resolveTarget(cwd, p) {
  return isAbsolute(p) ? p : resolve(cwd, p)
}

// 会话工作目录：exec 注入的运行时信息；取不到时退回进程 cwd。
function sessionCwd(exec) {
  return exec.agent?.session?.header?.cwd ?? process.cwd()
}

// Dolphin 两个入口返回统一形态的对象；这里渲染成 Agent 可读的中文文本。
function formatScanOutcome(result) {
  if (!result.ok) return `扫描失败：${result.error ?? '未知错误'}`
  const truncated = result.truncated ? `（共 ${result.total} 个，超出上限，仅展示前 ${result.shown} 个）` : ''
  return [
    `本地扫描完成：检出 ${result.total} 个问题${truncated}。`,
    `报告已存档：${result.reportFile}`,
    `概要：${JSON.stringify(result.summary, null, 2)}`,
  ].join('\n')
}

function formatPatrolOutcome(result) {
  if (!result.ok) {
    // 健康检查失败最常见原因是别名未登记 / 主机不可达，给 Agent 明确指引。
    if (result.stage === 'healthcheck') {
      return `巡逻失败（主机连通性检查）：${result.error}。提示：请先确认该 SSH 主机别名已登记，且主机在线、凭据有效。`
    }
    return `巡逻失败（阶段 ${result.stage}）：${result.error}`
  }
  const truncated = result.truncated ? `（共 ${result.total} 个，超出上限，仅展示前 ${result.shown} 个）` : ''
  return [
    `远程巡逻完成（${result.host}）：检出 ${result.total} 个问题${truncated}。`,
    `报告已存档：${result.reportFile}`,
    `概要：${JSON.stringify(result.summary, null, 2)}`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// 工具注册
// ---------------------------------------------------------------------------

export function apply(ctx) {
  // 本地 Semgrep 扫描：包装 runLocalScan(targetDir)。
  ctx.tools.register(defineTool({
    name: 'dolphin_scan',
    description: '对本地目录运行 Semgrep 代码安全扫描，返回按文件分组的检出问题（含行号与严重级别），并将结构化报告存档到 reports/。',
    parameters: {
      targetDir: {
        type: 'string',
        required: true,
        description: '要扫描的目录路径（绝对路径，或相对于会话工作目录的相对路径）。',
      },
    },
    output: {
      schema: { type: 'string' },
      render: renderText,
    },
    async execute(args, exec) {
      try {
        const target = resolveTarget(sessionCwd(exec), args.targetDir)
        const result = await runLocalScan(target)
        return formatScanOutcome(result)
      } catch (e) {
        return `扫描执行异常：${e?.message ?? e}`
      }
    },
  }))

  // 远程 SSH 巡逻：包装 runPatrol(alias, targetDir)。
  ctx.tools.register(defineTool({
    name: 'dolphin_patrol',
    description: '对已登记的 SSH 主机执行远程安全巡逻（连通性检查 → 远程 Semgrep 扫描 → 结构化发现回收并存档 reports/）。重要：执行前请先登记 SSH 主机别名（否则健康检查会失败），并确认远端目录路径真实存在。',
    parameters: {
      alias: {
        type: 'string',
        required: true,
        description: '已登记的 SSH 主机别名（Dolphin 主机库中的 key，登记方式见 README 的 createHostStore 用法）。',
      },
      targetDir: {
        type: 'string',
        required: true,
        description: '远端主机上要扫描的目录路径。',
      },
    },
    output: {
      schema: { type: 'string' },
      render: renderText,
    },
    async execute(args, exec) {
      try {
        const result = await runPatrol(args.alias, args.targetDir)
        return formatPatrolOutcome(result)
      } catch (e) {
        return `巡逻执行异常：${e?.message ?? e}`
      }
    },
  }))
}
