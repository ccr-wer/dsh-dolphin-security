// 扫描逻辑：调用 semgrep，解析结果，生成中文 Markdown 报告。
// 单独放在这个文件里，方便脱离 DSH 用 node 单独测试。

import { execFile } from 'node:child_process'

// 严重级别排序权重：数字越小，在报告里越靠前
const SEVERITY_ORDER = { ERROR: 0, WARNING: 1, INFO: 2 }

// 报告中最多显示的漏洞条数，避免撑爆 Agent 的上下文
const DEFAULT_MAX_FINDINGS = 200

// 运行 semgrep，返回三种结果之一：
//   { kind: 'ok', stdout }     —— 扫描成功（含「有问题」和「没问题」两种情况）
//   { kind: 'missing' }        —— 机器上没装 semgrep
//   { kind: 'error', message } —— semgrep 运行出错
//
// 用回调包一层，是因为 semgrep 的退出码比较特殊：
//   0 = 扫描成功但没发现问题
//   1 = 扫描成功且发现了问题（stdout 里仍是完整 JSON，属于正常情况）
//   2 = 扫描失败
// 构建 semgrep 命令行参数（抽成纯函数，便于单测与上层复用）
// 规则集注入：传入 rulesConfig 时，往命令行加 --config <rulesConfig>
// （原实现只有 ['scan', '--json', targetDir]，依赖 semgrep 默认规则集）
export function buildSemgrepArgs(targetDir, rulesConfig) {
  const args = ['scan', '--json']
  if (rulesConfig) {
    args.push('--config', rulesConfig)
  }
  args.push(targetDir)
  return args
}

function runSemgrep(targetDir, timeoutMs, rulesConfig) {
  return new Promise((resolvePromise) => {
    execFile(
      'semgrep',
      buildSemgrepArgs(targetDir, rulesConfig),
      { timeout: timeoutMs, maxBuffer: 50 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          // 找不到 semgrep 命令
          if (error.code === 'ENOENT') {
            resolvePromise({ kind: 'missing' })
            return
          }
          // 退出码 1：发现了问题，但扫描本身是成功的
          if (error.code === 1) {
            resolvePromise({ kind: 'ok', stdout, stderr })
            return
          }
          // 超时被杀
          if (error.killed || error.signal) {
            resolvePromise({ kind: 'error', message: `扫描超时（${timeoutMs}ms），请缩小扫描范围。` })
            return
          }
          resolvePromise({ kind: 'error', message: stderr || error.message })
          return
        }
        // 退出码 0：扫描成功，无问题
        resolvePromise({ kind: 'ok', stdout, stderr })
      },
    )
  })
}

// 把 semgrep 的原始结果，规整成我们需要的字段
function normalizeFindings(results) {
  if (!Array.isArray(results)) return []
  return results
    .filter((r) => r && r.path && r.start && typeof r.start.line === 'number' && r.extra)
    .map((r) => ({
      file: r.path,
      line: r.start.line,
      severity: r.extra.severity || 'INFO',
      checkId: r.check_id || 'unknown',
      message: r.extra.message || '',
    }))
}

// 排序：先按严重级别（ERROR → WARNING → INFO），同级再按文件、行号
function compareFindings(a, b) {
  const sa = SEVERITY_ORDER[a.severity] ?? 3
  const sb = SEVERITY_ORDER[b.severity] ?? 3
  if (sa !== sb) return sa - sb
  if (a.file !== b.file) return a.file < b.file ? -1 : 1
  return a.line - b.line
}

// 统计每个严重级别的数量
function countBySeverity(findings) {
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 }
  for (const f of findings) {
    counts[f.severity] = (counts[f.severity] ?? 0) + 1
  }
  return counts
}

// 生成中文 Markdown 报告
//   findings —— 已经排好序、截断后的列表
//   total    —— 截断前的总条数
//   targetDir —— 被扫描的目录（用于显示）
//   truncated —— 是否发生过截断
function buildReport(findings, total, targetDir, truncated) {
  if (total === 0) {
    return `# semgrep 扫描报告\n\n- 扫描目录：\`${targetDir}\`\n- 结果：✅ 未发现问题\n`
  }

  const counts = countBySeverity(findings)
  const lines = []
  lines.push('# semgrep 扫描报告')
  lines.push('')
  lines.push(`- 扫描目录：\`${targetDir}\``)
  lines.push(`- 发现问题：共 ${total} 处（ERROR ${counts.ERROR ?? 0} / WARNING ${counts.WARNING ?? 0} / INFO ${counts.INFO ?? 0}）`)
  if (truncated) {
    lines.push(`- 显示：按严重级别优先，只显示前 ${findings.length} 处`)
  }
  lines.push('')

  // 按文件分组（findings 已排好序，这里按顺序分组即可保持稳定）
  const byFile = new Map()
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }

  for (const [file, list] of byFile) {
    lines.push(`## ${file}（${list.length} 处）`)
    lines.push('')
    for (const f of list) {
      lines.push(`- [${f.severity}] 第 ${f.line} 行 · 规则 \`${f.checkId}\`：${f.message}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// 主入口：扫描一个目录
// 返回 { ok: true, text: <报告> } 或 { ok: false, message: <友好错误提示> }
export async function scanDirectory(targetDir, options = {}) {
  const maxFindings = options.maxFindings ?? DEFAULT_MAX_FINDINGS
  const timeoutMs = options.timeoutMs ?? 120000
  const rulesConfig = options.rulesConfig ?? null
  // raw=true 时，在返回值里附带原始 semgrep results（供上层做结构化提取）
  const raw = options.raw ?? false

  const outcome = await runSemgrep(targetDir, timeoutMs, rulesConfig)

  if (outcome.kind === 'missing') {
    return {
      ok: false,
      message: '未检测到 semgrep 命令。请先在终端执行 `pip install semgrep` 安装（Windows），安装完成后重启 dsh 再试。',
    }
  }
  if (outcome.kind === 'error') {
    return {
      ok: false,
      message: `semgrep 扫描失败：${String(outcome.message).slice(0, 500)}`,
    }
  }

  let results
  try {
    results = JSON.parse(outcome.stdout).results ?? []
  } catch {
    return { ok: false, message: 'semgrep 返回的内容无法解析为 JSON（可能输出过大被截断，或版本不兼容）。' }
  }

  const findings = normalizeFindings(results).sort(compareFindings)
  const total = findings.length
  const truncated = total > maxFindings
  const shown = truncated ? findings.slice(0, maxFindings) : findings

  const report = { ok: true, text: buildReport(shown, total, targetDir, truncated) }
  if (raw) {
    report.rawResults = results
  }
  return report
}
