/**
 * dsh-perf 保持观感的助手消息 shadow。
 *
 * 设计: 不替换官方渲染的任何视觉 —— 所有 assistant-step 节点都经官方渲染器输出
 * (样式、推理行、代码块、图片、操作按钮完全同款)。干预只有两处时机, 不改任何像素:
 *
 * 1. 超重消息(settled 且加权负载分 > 阈值)首次渲染强制以 "running"(流式) 形态
 *    转交官方 —— 官方流式分支本来就不打 shiki/KaTeX(源码: streaming ? void 0 :
 *    高亮), 节点外观与官方流式期间的普通样式完全一致; 随后经全局串行翻转队列
 *    (perf-flip-queue) 把状态逐条翻回 settled —— 会话打开/多步回合时 N 条 heavy
 *    消息不再同帧集体翻转(单帧 N x 全量解析+高亮突发), 而是按间隔摊开。
 * 2. 负载评估从纯字符数升级为加权分(perf-heaviness): 代码围栏字符双倍计、
 *    每个数学公式按固定成本计、reasoning/tool-call 按低权重计 —— 覆盖
 *    "12 围栏 x 400 行约 15k 字符"这类不触发旧阈值但 settle 突发同样重的消息。
 *
 * 实验项(默认关闭, localStorage dsh-perf-stream-cooldown=毫秒): 流式期间对
 * 超重节点做转发冷却 —— 每帧仍然重渲染本 shadow, 但只在冷却窗口外才把最新
 * node 引用转交官方 memo 渲染器(窗口内转交上一次引用, 官方 memo 直接跳过),
 * 尾部由定时器保底追平。文本以更粗粒度跳动出现, 属可见差异, 故默认关。
 *
 * 官方捕获: 注册时序上本插件 inject 回调先于官方回调执行, 因此捕获放在首次渲染
 * (全部插件已 apply) 时进行, 且必须排除自身(entries 按 priority 排序, 自身在前)。
 * 捕获失败时仍走官方失败面(渲染 JsonBlock 兜底), 绝不出现降载视图。
 */
import { createElement, memo, useEffect, useReducer, useRef, useState, type ComponentType } from 'react'
import { scoreBlocks, type HeavinessBlock } from './perf-heaviness'
import { makeFlipQueue } from './perf-flip-queue'

interface ShadowBlock extends HeavinessBlock {
  lang?: string
}

interface ShadowData {
  status?: string
  blocks?: ShadowBlock[]
}

export interface ShadowOwner {
  node?: { key?: string; kind?: string; data?: ShadowData }
  useTurnData?: (key: string) => unknown
  openFile?: unknown
  renderMessageImages?: unknown
  fileMentions?: unknown
  t?: (key: string) => string
  [k: string]: unknown
}

const DEFAULT_THRESHOLD = 20000
const FINALIZE_DELAY_MS = 600
const DEFAULT_FLIP_INTERVAL_MS = 120

function readPositiveInt(key: string, fallback: number): number {
  try {
    const value = Number(localStorage.getItem(key))
    return Number.isFinite(value) && value > 0 ? Math.round(value) : fallback
  } catch { return fallback }
}

function threshold(): number {
  return readPositiveInt('dsh-perf-shadow-threshold', DEFAULT_THRESHOLD)
}

/** 流式转发冷却(毫秒); 0 = 关闭(默认)。 */
function debugEnabled(): boolean {
  try { return localStorage.getItem('dsh-perf-debug') === '1' } catch { return false }
}

function streamCooldownMs(): number {
  try {
    const value = Number(localStorage.getItem('dsh-perf-stream-cooldown'))
    return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0
  } catch { return 0 }
}

/** 模块级单例: 全部 heavy 消息共享一条翻转队列(这正是错峰的意义)。 */
const flipQueue = makeFlipQueue({
  delayMs: FINALIZE_DELAY_MS,
  get intervalMs(): number {
    return readPositiveInt('dsh-perf-flip-interval', DEFAULT_FLIP_INTERVAL_MS)
  },
})

/** Build the shadow component around the official assistant-step renderer.
 * @param official - 注册期捕获的官方渲染器(可能尚未注册, 直接传 undefined)。
 * @param enabled - renderDegrade 开关读取器; 关闭时直接转交官方, 零干预。
 * @param captureOfficial - 渲染期懒捕获器(须排除影子自身)。
 */
export function makePerfAssistantShadow(
  official: ComponentType<ShadowOwner> | undefined,
  enabled: () => boolean = (): boolean => true,
  captureOfficial?: () => ComponentType<ShadowOwner> | undefined,
): ComponentType<ShadowOwner> {
  const Shadow = memo(function PerfAssistantShadow(props: ShadowOwner) {
    const officialRef = useRef<ComponentType<ShadowOwner> | undefined>(official)
    if (officialRef.current === undefined && captureOfficial !== undefined) {
      officialRef.current = captureOfficial()
    }
    const data = props.node?.data
    const isAssistant = props.node?.kind === 'assistant-step'
    const streaming = isAssistant && data?.status === 'running'
    const heavy = enabled() && isAssistant && data?.status === 'settled' && scoreBlocks(data?.blocks ?? []) > threshold()
    const [finalized, setFinalized] = useState(!heavy)
    useEffect(() => {
      if (!heavy || finalized) return
      let cancelled = false
      const debug = debugEnabled()
      if (debug) console.log('[dsh-perf] shadow: heavy settled enqueued, queue size ' + flipQueue.size)
      const cancel = flipQueue.enqueue((): void => {
        if (debug) console.log('[dsh-perf] shadow: flip to settled, remaining ' + flipQueue.size)
        if (!cancelled) setFinalized(true)
      })
      return (): void => { cancelled = true; cancel() }
    }, [heavy, finalized])

    // 实验: 流式转发冷却(默认关)。冷却窗口内向官方转交上一次 node 引用,
    // 官方 memo(assistant-step) 因引用相等直接跳过本帧渲染。
    const cooldown = streaming ? streamCooldownMs() : 0
    const [, bump] = useReducer((tick: number): number => tick + 1, 0)
    const forwardRef = useRef<{ at: number; node: ShadowOwner["node"]; latest: ShadowOwner["node"]; timer: ReturnType<typeof setTimeout> | undefined }>({ at: 0, node: undefined, latest: undefined, timer: undefined })
    useEffect((): (() => void) => (): void => {
      const forward = forwardRef.current
      if (forward.timer !== undefined) clearTimeout(forward.timer)
      forward.timer = undefined
    }, [])
    let renderNode = props.node
    if (cooldown > 0 && streaming) {
      const forward = forwardRef.current
      forward.latest = props.node
      const at = Date.now()
      if (forward.node === undefined || at - forward.at >= cooldown) {
        forward.at = at
        forward.node = props.node
      } else {
        renderNode = forward.node
        if (forward.timer === undefined) {
          forward.timer = setTimeout((): void => {
            forward.timer = undefined
            forward.at = Date.now()
            forward.node = forward.latest
            bump()
          }, cooldown - (at - forward.at))
        }
      }
    } else {
      forwardRef.current.node = props.node
    }

    if (officialRef.current === undefined) {
      // 无官方可转交: 按官方 slot 的 fallback 兜底(JsonBlock), 不改视觉契约。
      return null
    }
    const overridden = renderNode !== props.node || (heavy && !finalized)
    const baseNode = renderNode ?? props.node
    const effective = !overridden
      ? props
      : {
          ...props,
          node: baseNode === undefined ? undefined : {
            ...baseNode,
            data: heavy && !finalized && baseNode.data !== undefined
              ? { ...baseNode.data, status: 'running' }
              : baseNode.data,
          },
        }
    return createElement(officialRef.current, effective)
  })
  return Shadow
}