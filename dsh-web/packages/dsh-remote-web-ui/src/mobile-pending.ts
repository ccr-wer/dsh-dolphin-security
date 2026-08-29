import type { MuxFrame } from '@deepseek-ai/dsh-host-apiproxy/api/events'
import type { RpcRequest } from '@deepseek-ai/dsh-host-apiproxy/api/rpc'

export interface PendingApproval {
  rpcId: string
  approvalId: string
  toolName: string
  callId?: string
  reason?: string
}

export interface PendingQuestion {
  rpcId: string
  questions: Array<{
    id: string
    question: string
    detail?: string
    header?: string
    options?: Array<{ label: string; description?: string }>
    multiSelect?: boolean
  }>
}

export interface PendingState {
  approvals: PendingApproval[]
  questions: PendingQuestion[]
}

export class PendingTracker {
  private readonly sessions = new Map<string, { approvals: Map<string, PendingApproval>; questions: PendingQuestion[] }>()

  /** Process one mux frame and update the pending state. */
  onFrame(frame: RpcRequest<MuxFrame>): void {
    const payload = frame.payload
    if (payload.type === 'approval/requested') {
      const state = this._getOrInit(payload.sessionId)
      state.approvals.set(payload.approvalId, {
        rpcId: frame.rpcId,
        approvalId: payload.approvalId,
        toolName: payload.toolName,
        callId: payload.callId,
        reason: payload.reason,
      })
    } else if (payload.type === 'approval/resolved') {
      const state = this.sessions.get(payload.sessionId)
      if (state) {
        state.approvals.delete(payload.approvalId)
      }
    } else if (payload.type === 'question/requested') {
      const state = this._getOrInit(payload.sessionId)
      state.questions.push({
        rpcId: frame.rpcId,
        questions: payload.questions as any,
      })
    } else if (payload.type === 'question/resolved') {
      const state = this.sessions.get(payload.sessionId)
      if (state) {
        state.questions = state.questions.filter(q => q.rpcId !== payload.questionRpcId)
      }
    }
  }

  private _getOrInit(sessionId: string) {
    let state = this.sessions.get(sessionId)
    if (!state) {
      state = { approvals: new Map(), questions: [] }
      this.sessions.set(sessionId, state)
    }
    return state
  }

  /** Query pending items for a session. */
  pending(sessionId: string): PendingState {
    const state = this.sessions.get(sessionId)
    if (!state) {
      return { approvals: [], questions: [] }
    }
    return {
      approvals: Array.from(state.approvals.values()),
      questions: state.questions,
    }
  }

  /** Clear all pending state for a session. */
  clear(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
}
