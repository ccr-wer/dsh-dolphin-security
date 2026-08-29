import type { ApiProxy } from '@deepseek-ai/dsh-host-apiproxy'
import { describe, expect, it, vi } from 'vitest'
import { createTask, type TaskRecord } from '../src/core/tasks.ts'
import { HostExecutionRunner, SessionLaunchError } from '../src/host-runner.ts'

function ok<T>(request: { rpcId: unknown }, value: T) {
  return { rpcId: request.rpcId, result: { ok: true as const, value } }
}

function configuredTask(): TaskRecord {
  return {
    ...createTask({ title: 'Run me', description: '', prompt: 'do work' }, 1, 'task-a'),
    workspaceId: 'workspace-a',
    mode: 'preset-a',
    permission: 'workspace-write',
  }
}

describe('HostExecutionRunner', () => {
  it('validates and applies workspace, preset, and permission before the task prompt', async () => {
    const order: string[] = []
    const promptPayloads: unknown[] = []
    const commands = {
      execute: vi.fn(async (_sessionId, line: string) => {
        order.push('permission')
        expect(line).toBe('/permission workspace-write')
        return { kind: 'success' as const }
      }),
    }
    const api = {
      workspace: { list: vi.fn(async (request) => { order.push('workspace'); return ok(request, { items: [{ workspaceId: 'workspace-a' }] }) }) },
      agentPresets: { list: vi.fn(async (request) => { order.push('preset'); return ok(request, { presets: [{ id: 'preset-a', isDefault: false }] }) }) },
      sessions: {
        create: vi.fn(async (request) => { order.push('create'); return ok(request, { sessionId: 'session-a', agentPreset: 'preset-a' }) }),
        rename: vi.fn(async (request) => { order.push('rename'); return ok(request, { title: 'Run me', seq: 1 }) }),
        prompt: vi.fn(async (request) => {
          promptPayloads.push(request.payload)
          order.push('prompt')
          return ok(request, { accepted: true })
        }),
      },
    }
    await expect(new HostExecutionRunner(api as unknown as ApiProxy, commands).launch(configuredTask())).resolves.toBe('session-a')
    expect(order).toEqual(['workspace', 'preset', 'create', 'rename', 'permission', 'prompt'])
    expect(api.sessions.create.mock.calls[0][0].payload).toMatchObject({ workspaceId: 'workspace-a', agentPreset: 'preset-a' })
    expect(promptPayloads).toEqual([{ sessionId: 'session-a', mode: 'queue', content: [{ type: 'text', text: 'do work' }] }])
  })

  it('fails closed on a stale workspace or unacknowledged permission command', async () => {
    const create = vi.fn()
    const missingWorkspace = {
      workspace: { list: async (request: { rpcId: unknown }) => ok(request, { items: [] }) },
      agentPresets: { list: vi.fn() },
      sessions: { create },
    }
    await expect(new HostExecutionRunner(missingWorkspace as unknown as ApiProxy).launch(configuredTask())).rejects.toThrow('workspace not found')
    expect(create).not.toHaveBeenCalled()

    const prompt = vi.fn()
    const permissionRejected = {
      workspace: { list: async (request: { rpcId: unknown }) => ok(request, { items: [{ workspaceId: 'workspace-a' }] }) },
      agentPresets: { list: async (request: { rpcId: unknown }) => ok(request, { presets: [{ id: 'preset-a' }] }) },
      sessions: {
        create: async (request: { rpcId: unknown }) => ok(request, { sessionId: 'session-a' }),
        rename: async (request: { rpcId: unknown }) => ok(request, { title: 'Run me', seq: 1 }),
        prompt,
      },
    }
    const unavailable = new HostExecutionRunner(permissionRejected as unknown as ApiProxy).launch(configuredTask())
    await expect(unavailable).rejects.toThrow('permission command dispatcher is unavailable')
    await expect(unavailable).rejects.toMatchObject({ sessionId: 'session-a' })
    expect(prompt).not.toHaveBeenCalled()

    const rejected = new HostExecutionRunner(permissionRejected as unknown as ApiProxy, {
      execute: async () => undefined,
    }).launch(configuredTask())
    await expect(rejected).rejects.toBeInstanceOf(SessionLaunchError)
    await expect(rejected).rejects.toMatchObject({ sessionId: 'session-a' })
    expect(prompt).not.toHaveBeenCalled()
  })

  it('fails closed when the permission command reports an error', async () => {
    const prompt = vi.fn()
    const api = {
      workspace: { list: async (request: { rpcId: unknown }) => ok(request, { items: [{ workspaceId: 'workspace-a' }] }) },
      agentPresets: { list: async (request: { rpcId: unknown }) => ok(request, { presets: [{ id: 'preset-a' }] }) },
      sessions: {
        create: async (request: { rpcId: unknown }) => ok(request, { sessionId: 'session-a' }),
        rename: async (request: { rpcId: unknown }) => ok(request, { title: 'Run me', seq: 1 }),
        prompt,
      },
    }
    const launch = new HostExecutionRunner(api as unknown as ApiProxy, {
      execute: async () => ({ kind: 'error', text: 'permission denied' }),
    }).launch(configuredTask())
    await expect(launch).rejects.toThrow('permission denied')
    expect(prompt).not.toHaveBeenCalled()
  })

  it('bounds permission dispatch and fails closed when the command throws', async () => {
    const timeoutSignal = new AbortController().signal
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal)
    try {
      const prompt = vi.fn()
      const execute = vi.fn(async (_sessionId: string, _line: string, signal: AbortSignal) => {
        expect(signal).toBe(timeoutSignal)
        throw new Error('permission command timed out')
      })
      const api = {
        workspace: { list: async (request: { rpcId: unknown }) => ok(request, { items: [{ workspaceId: 'workspace-a' }] }) },
        agentPresets: { list: async (request: { rpcId: unknown }) => ok(request, { presets: [{ id: 'preset-a' }] }) },
        sessions: {
          create: async (request: { rpcId: unknown }) => ok(request, { sessionId: 'session-a' }),
          rename: async (request: { rpcId: unknown }) => ok(request, { title: 'Run me', seq: 1 }),
          prompt,
        },
      }
      const launch = new HostExecutionRunner(api as unknown as ApiProxy, { execute }).launch(configuredTask())
      await expect(launch).rejects.toMatchObject({
        name: 'SessionLaunchError',
        sessionId: 'session-a',
        message: expect.stringContaining('permission command timed out'),
      })
      expect(timeout).toHaveBeenCalledOnce()
      expect(timeout).toHaveBeenCalledWith(30_000)
      expect(prompt).not.toHaveBeenCalled()
    } finally {
      timeout.mockRestore()
    }
  })

  it('settles from session list plus the newest turn end and waits on read failures', async () => {
    let running = true
    let historyOk = true
    const api = {
      sessions: {
        list: async (request: { rpcId: unknown }) => ok(request, { items: [{ sessionId: 'session-a', running }] }),
        history: async (request: { rpcId: unknown }) => historyOk
          ? ok(request, { events: [{ event: { type: 'turn/end', data: { reason: { kind: 'error' } } } }], hasMore: false })
          : { rpcId: request.rpcId, result: { ok: false as const, error: { code: 'offline', message: 'offline' } } },
      },
    }
    const runner = new HostExecutionRunner(api as unknown as ApiProxy)
    await expect(runner.inspect('session-a')).resolves.toEqual({ outcome: 'pending' })
    running = false
    await expect(runner.inspect('session-a')).resolves.toEqual({ outcome: 'failed', error: 'agent turn ended with an error' })
    historyOk = false
    await expect(runner.inspect('session-a')).resolves.toEqual({ outcome: 'pending' })
  })

  it('pages backward to the execution turn and ignores later user turns in the same session', async () => {
    const history = vi.fn(async (request: { rpcId: unknown; payload: { beforeSeq?: number } }) => request.payload.beforeSeq === undefined
      ? ok(request, {
          events: [{ event: { type: 'turn/end', seq: 300, time: 3_000, data: { reason: { kind: 'error' } } } }],
          hasMore: true,
        })
      : ok(request, {
          events: [
            { event: { type: 'turn/end', seq: 100, time: 1_100, data: { reason: { kind: 'complete' } } } },
            { event: { type: 'session/start', seq: 90, time: 900, data: {} } },
          ],
          hasMore: false,
        }))
    const api = {
      sessions: {
        list: async (request: { rpcId: unknown }) => ok(request, { items: [{ sessionId: 'session-a', running: false }] }),
        history,
      },
    }
    await expect(new HostExecutionRunner(api as unknown as ApiProxy).inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'succeeded' })
    // One one-message probe, then the two backward pages.
    expect(history).toHaveBeenCalledTimes(3)
    expect(history.mock.calls[0][0].payload).toMatchObject({ maxMessages: 1 })
    expect(history.mock.calls[2][0].payload.beforeSeq).toBe(300)
  })

  it('carries the session list in listRunning and reuses it in inspect without another list RPC', async () => {
    const items = [{ sessionId: 'session-a', running: false }]
    const list = vi.fn(async (request: { rpcId: unknown }) => ok(request, { items }))
    const history = vi.fn(async (request: { rpcId: unknown }) => ok(request, {
      events: [{ event: { type: 'turn/end', seq: 10, time: 1_100, data: { reason: { kind: 'complete' } } } }],
      hasMore: false,
    }))
    const runner = new HostExecutionRunner({ sessions: { list, history } } as unknown as ApiProxy)
    const running = await runner.listRunning()
    expect(running).toEqual({ known: true, count: 0, items })
    if (!running.known) throw new Error('expected known')
    await expect(runner.inspect('session-a', 1_000, running.items)).resolves.toEqual({ outcome: 'succeeded' })
    expect(list).toHaveBeenCalledOnce()
    // Probe page plus the scan page; no second list RPC.
    expect(history).toHaveBeenCalledTimes(2)
  })

  it('probes the history head instead of re-scanning a wedged session whose newest seq is unchanged', async () => {
    let headSeq = 40
    const history = vi.fn(async (request: { rpcId: unknown; payload: { maxMessages?: number } }) => {
      if (request.payload.maxMessages === 1) {
        return ok(request, { events: [{ event: { type: 'assistant/message', seq: headSeq, time: 4_000, data: {} } }], hasMore: false })
      }
      // Full page: no turn/end anywhere — the execution can never settle.
      return ok(request, {
        events: [{ event: { type: 'assistant/message', seq: headSeq, time: 4_000, data: {} } }],
        hasMore: false,
      })
    })
    const api = {
      sessions: {
        list: async (request: { rpcId: unknown }) => ok(request, { items: [{ sessionId: 'session-a', running: false }] }),
        history,
      },
    }
    const runner = new HostExecutionRunner(api as unknown as ApiProxy)
    await expect(runner.inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'pending' })
    const afterFirst = history.mock.calls.length
    expect(afterFirst).toBe(2) // probe + one complete page

    // Head unchanged: the second tick probes once and skips the scan.
    await expect(runner.inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'pending' })
    expect(history.mock.calls.length).toBe(afterFirst + 1)
    expect(history.mock.calls[afterFirst]?.[0].payload).toMatchObject({ maxMessages: 1 })

    // A later event bumps the head: the next tick runs the full scan again.
    headSeq = 41
    await expect(runner.inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'pending' })
    expect(history.mock.calls.length).toBe(afterFirst + 3)
  })

  it('drops the scan memo once the execution settles or the session vanishes', async () => {
    let headSeq = 40
    let found = false
    const history = vi.fn(async (request: { rpcId: unknown; payload: { maxMessages?: number } }) => {
      if (request.payload.maxMessages === 1) {
        return ok(request, { events: [{ event: { type: 'assistant/message', seq: headSeq, time: 4_000, data: {} } }], hasMore: false })
      }
      return ok(request, {
        events: found
          ? [{ event: { type: 'turn/end', seq: headSeq, time: 4_000, data: { reason: { kind: 'complete' } } } }]
          : [{ event: { type: 'assistant/message', seq: headSeq, time: 4_000, data: {} } }],
        hasMore: false,
      })
    })
    const api = {
      sessions: {
        list: async (request: { rpcId: unknown }) => ok(request, { items: [{ sessionId: 'session-a', running: false }] }),
        history,
      },
    }
    const runner = new HostExecutionRunner(api as unknown as ApiProxy)
    await expect(runner.inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'pending' })
    // Late-arriving turn/end bumps the head; the full scan settles it.
    found = true
    headSeq = 41
    await expect(runner.inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'succeeded' })
    // After settling, a vanished session reports cancelled without probing.
    const callsBefore = history.mock.calls.length
    api.sessions.list = async (request: { rpcId: unknown }) => ok(request, { items: [] })
    await expect(runner.inspect('session-a', 1_000)).resolves.toEqual({ outcome: 'cancelled', error: 'execution session no longer exists' })
    expect(history.mock.calls.length).toBe(callsBefore)
  })
})
