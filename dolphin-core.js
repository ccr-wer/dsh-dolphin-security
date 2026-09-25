// ============================================================================
// dolphin-core.js —— Project Dolphin 的「眼睛」：主动巡检扫描核心
// ----------------------------------------------------------------------------
// 职责：
//   1. 直接复用 dsh-code-scan 的 scanDirectory() 作为底层 semgrep 扫描器
//   2. 规则集注入：默认注入本地规则集 rules/dolphin-core.yml（MIT/Apache-2.0）
//   3. 数据增强：捕获 semgrep 原始 JSON，提取 metadata / start.col / end / extra.lines，
//      映射成结构化 SecurityFinding
//   4. 输出融合：同时产出 Markdown 巡检报告 + 结构化 JSON 报告，写入 reports/ 目录
//   5. 容错处理：semgrep 缺失、超时、JSON 解析失败均给出友好提示
//
// 用法：
//   node dolphin-core.js <目录>           真实扫描
//   node dolphin-core.js --mock [目录]    用内置 mock 数据自测完整管线（无需 semgrep）
//   node dolphin-core.js --help           查看帮助
// ============================================================================

import { scanDirectory } from './dsh-code-scan/lib/scanner.js'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// ---- 常量 ----------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPORTS_DIR = join(__dirname, 'reports')
const DEFAULT_RULES = join(__dirname, 'rules', 'dolphin-core.yml')
const DEFAULT_TIMEOUT = 120000
const DEFAULT_MAX_FINDINGS = 200

// ---- SecurityFinding 结构（字段约定） ------------------------------------
// {
//   file:            string          源文件路径（semgrep 的 r.path）
//   line:            number          起始行号（r.start.line）
//   col:             number|null     起始列号（r.start.col）
//   end:             {line,col}|null 结束位置（r.end）
//   severity:        string          ERROR / WARNING / INFO（r.extra.severity）
//   checkId:         string          规则 ID（r.check_id）
//   message:         string          问题描述（r.extra.message）
//   codeSnippet:     string|null     问题代码行（r.extra.lines）
//   remediationHint: string          修复建议（从 metadata/fix/cwe 推导）
//   metadata:        object|null     原始 metadata（r.extra.metadata）
// }

// ---- 规则 ID 归一化：剥离 semgrep 注入的配置路径前缀 -------------------------
// 背景（semgrep 1.175.0 实测）：--config 指向本地文件时，semgrep 会把「配置路径」
// 点号化后拼到 check_id 前面，例如：
//   rules.dolphin.hardcoded-credentials
//   D.DSH.profiles.web.node_modules.dsh-dolphin-security.rules.dolphin.hardcoded-credentials
// 前缀形态 = dotted(relpath(config, 子进程 cwd))；当 config 不在 cwd 子树内（含跨盘，
// 也就是插件挂在 DSH 下的实际情况）时直接退化为 dotted(绝对路径)。
// 后果：规则 ID 随安装位置漂移、泄漏本机绝对路径、跨机不可移植，
// 也与 README / CHANGELOG 里写的 `dolphin.hardcoded-credentials` 不一致。
//
// 修法：不去猜前缀（改相对路径无效 —— cwd 不可预期，且 config 不在 cwd 子树内时
// semgrep 照样回退绝对路径），改为「拿规则文件里的真实 ID 集合做后缀精确匹配」。
// 只依赖规则文件自身内容，与 semgrep 版本、cwd、盘符、远端路径全都无关。
const RULE_ID_LINE = /^[ \t]*-[ \t]+id:[ \t]*(\S+)[ \t]*$/gm

// 规则文件 → ID 集合，按 config 字符串缓存（进程内只读一次盘）。
// registry 包（p/... 等）与非本地路径读不到文件，静默得空集 —— 它们本来也不带前缀。
const ruleIdIndexCache = new Map()

export function buildRuleIdIndex(rulesConfig) {
  const ids = new Set()
  for (const rc of String(rulesConfig ?? '').split(/\s+/).filter(Boolean)) {
    let local = ruleIdIndexCache.get(rc)
    if (!local) {
      local = new Set()
      try {
        for (const m of readFileSync(rc, 'utf8').matchAll(RULE_ID_LINE)) local.add(m[1])
      } catch {
        // 读不到就保持空集：归一化退化为原样透传，绝不猜
      }
      ruleIdIndexCache.set(rc, local)
    }
    for (const id of local) ids.add(id)
  }
  return ids
}

// 归一化单个 check_id：前缀本就干净（命中白名单）→ 原样返回；
// 否则取「最长的后缀匹配」剥离前缀 —— 取最长是为了避免规则 ID 之间
// 存在后缀关系时把正常 ID 截短。
export function normalizeCheckId(checkId, ruleIds) {
  if (typeof checkId !== 'string' || checkId === '') return 'unknown'
  if (!ruleIds || ruleIds.size === 0) return checkId
  if (ruleIds.has(checkId)) return checkId
  let best = null
  for (const id of ruleIds) {
    if (checkId.endsWith('.' + id) && (best === null || id.length > best.length)) best = id
  }
  return best ?? checkId
}

// ---- 修复建议推导 ----------------------------------------------------------
function resolveRemediation(meta, extra) {
  if (meta && typeof meta.remediation === 'string' && meta.remediation) {
    return meta.remediation
  }
  if (extra && typeof extra.fix === 'string' && extra.fix) {
    return `规则提供了自动修复补丁：${extra.fix.slice(0, 200)}`
  }
  if (meta && Array.isArray(meta.cwe) && meta.cwe.length) {
    // semgrep 的 metadata.cwe 通常已带 "CWE-" 前缀（如 "CWE-89"），做兼容处理避免重复前缀
    const cwes = meta.cwe.map((c) =>
      String(c).toUpperCase().startsWith('CWE-') ? String(c) : `CWE-${c}`,
    )
    return `参考 ${cwes.join('、')}`
  }
  if (meta && typeof meta.category === 'string' && meta.category) {
    return `类别：${meta.category}`
  }
  return '请查阅 semgrep 规则文档获取修复建议'
}

// ---- 数据增强：semgrep 原始 results → SecurityFinding[] ---------------------
export function extractStructuredFindings(rawResults, options = {}) {
  if (!Array.isArray(rawResults)) return []
  // 规则 ID 白名单：默认用内置规则集，调用方可传自定义 rulesConfig 的索引
  const ruleIds = options.ruleIds ?? buildRuleIdIndex(DEFAULT_RULES)
  return rawResults
    .filter((r) => r && r.path && r.start && typeof r.start.line === 'number' && r.extra)
    .map((r) => {
      const meta = r.extra.metadata ?? null
      return {
        file: r.path,
        line: r.start.line,
        col: typeof r.start.col === 'number' ? r.start.col : null,
        end: r.end && typeof r.end.line === 'number'
          ? { line: r.end.line, col: typeof r.end.col === 'number' ? r.end.col : null }
          : null,
        severity: r.extra.severity || 'INFO',
        checkId: normalizeCheckId(r.check_id, ruleIds),
        message: r.extra.message || '',
        codeSnippet: typeof r.extra.lines === 'string' ? r.extra.lines : null,
        remediationHint: resolveRemediation(meta, r.extra),
        metadata: meta,
      }
    })
}

// ---- 严重级别排序与统计 ----------------------------------------------------
// 以下常量与三个工具函数是全局唯一实现：dolphin-patrol.js 曾各存一份副本且逐字相同，
// 有实现漂移风险，已统一收敛到此处并由 patrol 复用。
export const SEVERITY_ORDER = { ERROR: 0, WARNING: 1, INFO: 2 }

export function sortFindings(findings) {
  return [...findings].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity] ?? 3
    const sb = SEVERITY_ORDER[b.severity] ?? 3
    if (sa !== sb) return sa - sb
    if (a.file !== b.file) return a.file < b.file ? -1 : 1
    if (a.line !== b.line) return a.line - b.line
    return (a.col ?? 0) - (b.col ?? 0)
  })
}

export function summarize(findings) {
  const s = { ERROR: 0, WARNING: 0, INFO: 0 }
  for (const f of findings) s[f.severity] = (s[f.severity] ?? 0) + 1
  return s
}

// ---- Markdown 巡检报告 -----------------------------------------------------
function buildMarkdown(findings, meta) {
  const lines = []
  lines.push('# Dolphin 主动巡检报告')
  lines.push('')
  lines.push(`- 扫描目录：\`${meta.targetDir}\``)
  lines.push(`- 规则集：\`${meta.rulesConfig}\``)
  lines.push(`- 生成时间：${meta.generatedAt}`)
  lines.push(`- 发现问题：共 ${meta.total} 处（ERROR ${meta.summary.ERROR} / WARNING ${meta.summary.WARNING} / INFO ${meta.summary.INFO}）`)
  if (meta.truncated) lines.push(`- 显示：只展示前 ${findings.length} 处（已按严重级别优先排序）`)
  lines.push('')

  if (findings.length === 0) {
    lines.push('✅ 未发现问题')
    return lines.join('\n')
  }

  const byFile = new Map()
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }

  for (const [file, list] of byFile) {
    lines.push(`## ${file}（${list.length} 处）`)
    lines.push('')
    for (const f of list) {
      const loc = f.col != null ? `${f.line}:${f.col}` : `${f.line}`
      lines.push(`- **[${f.severity}]** 第 ${loc} 行 · 规则 \`${f.checkId}\`：${f.message}`)
      if (f.codeSnippet) {
        lines.push('')
        lines.push('  ```')
        lines.push(f.codeSnippet.split('\n').map((s) => `  ${s}`).join('\n').replace(/\n$/, ''))
        lines.push('  ```')
      }
      lines.push(`  - 修复建议：${f.remediationHint}`)
      lines.push('')
    }
  }
  return lines.join('\n')
}

// ---- 结构化 JSON payload ----------------------------------------------------
function buildJsonPayload(findings, meta) {
  return {
    generatedAt: meta.generatedAt,
    targetDir: meta.targetDir,
    rulesConfig: meta.rulesConfig,
    total: meta.total,
    truncated: meta.truncated,
    summary: meta.summary,
    findings,
  }
}

// ---- 时间戳（本地时区，YYYYMMDD-HHmmss） ------------------------------------
export function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

// ---- 输出融合：Markdown + JSON 双报告落盘（runScan 与 --mock 自测路径共用）----
function writeReports(findings, meta, reportsDir = REPORTS_DIR) {
  mkdirSync(reportsDir, { recursive: true })
  const ts = timestamp()
  const mdPath = join(reportsDir, `dolphin-report-${ts}.md`)
  const jsonPath = join(reportsDir, `dolphin-report-${ts}.json`)
  writeFileSync(mdPath, buildMarkdown(findings, meta), 'utf8')
  writeFileSync(jsonPath, JSON.stringify(buildJsonPayload(findings, meta), null, 2), 'utf8')
  return { mdPath, jsonPath }
}

// ---- 主扫描流程 ------------------------------------------------------------
export async function runScan(targetDir, options = {}) {
  const rulesConfig = options.rulesConfig ?? DEFAULT_RULES
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT
  const maxFindings = options.maxFindings ?? DEFAULT_MAX_FINDINGS

  // 1. 调用底层扫描器（raw=true 拿原始 results 用于结构化提取）
  const outcome = await scanDirectory(targetDir, {
    rulesConfig,
    timeoutMs,
    maxFindings,
    raw: true,
  })

  // 2. 容错：semgrep 缺失 / 超时 / 运行失败 / JSON 解析失败
  if (!outcome.ok) {
    return { ok: false, message: outcome.message }
  }

  // 3. 数据增强：原始 results → SecurityFinding[]
  //    ruleIds 用本次实际生效的 rulesConfig 构建，覆盖调用方自定义规则集的场景
  const findings = sortFindings(
    extractStructuredFindings(outcome.rawResults, { ruleIds: buildRuleIdIndex(rulesConfig) }),
  )
  const total = findings.length
  const truncated = total > maxFindings
  const shown = truncated ? findings.slice(0, maxFindings) : findings

  const meta = {
    generatedAt: new Date().toISOString(),
    targetDir: resolve(targetDir),
    rulesConfig,
    total,
    truncated,
    summary: summarize(shown),
  }

  // 4. 输出融合：写 Markdown + JSON 到 reports/
  const { mdPath, jsonPath } = writeReports(shown, meta)

  return {
    ok: true,
    total,
    truncated,
    shown: shown.length,
    summary: meta.summary,
    mdPath,
    jsonPath,
    findings: shown,
  }
}

// ---- 内置 mock 数据（用于无 semgrep 环境下自测完整管线） --------------------
function mockRawResults() {
  return [
    {
      check_id: 'python.lang.security.audit.dangerous-system-call.dangerous-system-call',
      path: 'demo/vuln.py',
      start: { line: 12, col: 5, offset: 210 },
      end: { line: 12, col: 24, offset: 229 },
      extra: {
        message: "Found user-controlled data in os.system() call. This could be vulnerable to command injection.",
        severity: 'ERROR',
        metadata: {
          category: 'security',
          cwe: ['CWE-78'],
          confidence: 'HIGH',
          remediation: '使用 subprocess.run 并显式传入参数列表，避免 shell 拼接用户输入。',
        },
        lines: '    os.system("rm -rf " + user_input)',
      },
    },
    {
      check_id: 'python.lang.security.audit.sql-injection.sql-injection',
      path: 'demo/app.py',
      start: { line: 30, col: 9, offset: 540 },
      end: { line: 30, col: 45, offset: 576 },
      extra: {
        message: 'Detected SQL statement that is tainted by user input.',
        severity: 'ERROR',
        metadata: { category: 'security', cwe: ['CWE-89'], confidence: 'HIGH' },
        lines: '    cur.execute("SELECT * FROM users WHERE id=" + uid)',
      },
    },
    {
      check_id: 'generic.ci.security.use-of-md5.use-of-md5',
      path: 'demo/hash.js',
      start: { line: 8, col: 1, offset: 100 },
      end: { line: 8, col: 28, offset: 127 },
      extra: {
        message: 'Detected use of the weak hash function MD5.',
        severity: 'WARNING',
        metadata: { category: 'crypto', cwe: ['CWE-328'] },
        lines: "const h = crypto.createHash('md5')",
      },
    },
  ]
}

// ---- CLI 入口 ----------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Dolphin 主动巡检核心（dolphin-core.js）

用法：
  node dolphin-core.js <目录>          对目录做真实 semgrep 扫描（需本机已装 semgrep）
  node dolphin-core.js --mock [目录]   用内置 mock 数据自测完整管线（无需 semgrep）

说明：
  默认规则集：rules/dolphin-core.yml（MIT/Apache-2.0，源自 GitLab SAST Rules）
  输出：<插件目录>/reports/dolphin-report-<时间戳>.{md,json}
`)
    return
  }

  const mock = args.includes('--mock')
  const positional = args.filter((a) => !a.startsWith('--'))
  const targetDir = positional[0] ?? __dirname

  if (mock) {
    console.log(`[Dolphin] 自测模式：注入 mock 数据（${targetDir}）\n`)
    // 直接走「数据增强 + 输出融合」两段，绕过 semgrep 调用
    const findings = sortFindings(extractStructuredFindings(mockRawResults()))
    const meta = {
      generatedAt: new Date().toISOString(),
      targetDir: resolve(targetDir),
      rulesConfig: DEFAULT_RULES,
      total: findings.length,
      truncated: false,
      summary: summarize(findings),
    }
    const { mdPath, jsonPath } = writeReports(findings, meta)
    console.log(`[Dolphin] 结构化提取：${findings.length} 条`)
    for (const f of findings) {
      console.log(`  - [${f.severity}] ${f.file}:${f.line}:${f.col} ${f.checkId}`)
    }
    console.log(`\n[Dolphin] Markdown 报告：${mdPath}`)
    console.log(`[Dolphin] JSON 报告：${jsonPath}`)
    return
  }

  console.log(`[Dolphin] 开始扫描：${targetDir}（规则集 ${DEFAULT_RULES}）\n`)
  const result = await runScan(targetDir)
  if (!result.ok) {
    console.log(`[Dolphin] 扫描未完成：${result.message}`)
    process.exitCode = 1
    return
  }
  console.log(`[Dolphin] 扫描完成：共 ${result.total} 处（ERROR ${result.summary.ERROR} / WARNING ${result.summary.WARNING} / INFO ${result.summary.INFO}）`)
  console.log(`[Dolphin] Markdown 报告：${result.mdPath}`)
  console.log(`[Dolphin] JSON 报告：${result.jsonPath}`)
}

// 仅当直接运行（node dolphin-core.js）时执行 main，被 import 时不执行。
// process.argv[1] 在 `node -e` / `--input-type=module` 场景下是 undefined，
// pathToFileURL(undefined) 会抛 TypeError，先做守卫。
const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  await main()
}
