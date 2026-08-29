import { describe, expect, it } from 'vitest'
import { PendingTracker } from '../src/mobile-pending.ts'
import type { MuxFrame } from '@deepseek-ai/dsh-host-apiproxy/api/events'
import type { RpcRequest } from '@deepseek-ai/dsh-host-apiproxy/api/rpc'
import { RpcId } from '@deepseek-ai/dsh-host-apiproxy/api/rpc'

function makeFrame(payload: MuxFrame): RpcRequest<MuxFrame> {
  return {
    rpcId: RpcId('test-rpc'),
    payload,
  }
}

describe('PendingTracker', () => {
  it('approval/requested adds to pending', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'approval/requested',
      sessionId: 'sess-1' as any,
      approvalId: 'app-1' as any,
      toolName: 'my-tool',
    }))
    
    expect(tracker.pending('sess-1')).toEqual({
      approvals: [{
        rpcId: 'test-rpc',
        approvalId: 'app-1',
        toolName: 'my-tool',
        callId: undefined,
        reason: undefined,
      }],
      questions: [],
    })
  })

  it('approval/resolved removes from pending', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'approval/requested',
      sessionId: 'sess-1' as any,
      approvalId: 'app-1' as any,
      toolName: 'my-tool',
    }))
    
    tracker.onFrame(makeFrame({
      type: 'approval/resolved',
      sessionId: 'sess-1' as any,
      approvalId: 'app-1' as any,
      outcome: 'allowed-once',
    }))
    
    expect(tracker.pending('sess-1')).toEqual({
      approvals: [],
      questions: [],
    })
  })

  it('question/requested adds to pending', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'question/requested',
      sessionId: 'sess-1' as any,
      questions: [{ id: 'q-1', question: 'Are you sure?' } as any],
    }))
    
    expect(tracker.pending('sess-1')).toEqual({
      approvals: [],
      questions: [{
        rpcId: 'test-rpc',
        questions: [{ id: 'q-1', question: 'Are you sure?' }],
      }],
    })
  })

  it('question/resolved removes from pending', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'question/requested',
      sessionId: 'sess-1' as any,
      questions: [{ id: 'q-1', question: 'Are you sure?' } as any],
    }))
    
    tracker.onFrame(makeFrame({
      type: 'question/resolved',
      sessionId: 'sess-1' as any,
      questionRpcId: RpcId('test-rpc'),
      outcome: 'answered',
    }))
    
    expect(tracker.pending('sess-1')).toEqual({
      approvals: [],
      questions: [],
    })
  })

  it('Multiple sessions are isolated', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'approval/requested',
      sessionId: 'sess-1' as any,
      approvalId: 'app-1' as any,
      toolName: 'tool-1',
    }))
    
    tracker.onFrame(makeFrame({
      type: 'approval/requested',
      sessionId: 'sess-2' as any,
      approvalId: 'app-2' as any,
      toolName: 'tool-2',
    }))
    
    expect(tracker.pending('sess-1').approvals).toHaveLength(1)
    expect(tracker.pending('sess-1').approvals[0].toolName).toBe('tool-1')
    
    expect(tracker.pending('sess-2').approvals).toHaveLength(1)
    expect(tracker.pending('sess-2').approvals[0].toolName).toBe('tool-2')
  })

  it('clear() removes all pending for a session', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'approval/requested',
      sessionId: 'sess-1' as any,
      approvalId: 'app-1' as any,
      toolName: 'tool-1',
    }))
    
    tracker.clear('sess-1')
    
    expect(tracker.pending('sess-1')).toEqual({
      approvals: [],
      questions: [],
    })
  })

  it('Unknown frame types are ignored', () => {
    const tracker = new PendingTracker()
    tracker.onFrame(makeFrame({
      type: 'session/event',
      sessionId: 'sess-1' as any,
      event: {} as any,
    }))
    
    expect(tracker.pending('sess-1')).toEqual({
      approvals: [],
      questions: [],
    })
  })
})
