/**
 * Boot-patch tests (issue #987): the parse-time inline script must decide
 * rewrites exactly like the browser patch (client/remote-channel.ts), seat
 * the adoption hooks, and restore cleanly. Runs the generated script against
 * a fake window — no browser needed.
 */
import { describe, expect, it } from 'vitest'

import { renderIndexInjections } from '@deepseek-ai/dsh-host-webserver'

import { buildRemoteChannelBootScript, REMOTE_CHANNEL_BOOT_SCRIPT } from '../src/remote-channel-boot.ts'
import { REMOTE_CHANNEL_BOOT_GLOBAL, type RemoteChannelBootSeat } from '../src/remote-channel-rules.ts'
import { shouldRewriteFetchPath, shouldRewriteWsPath } from '../src/client/remote-channel.ts'

const PATH_MATRIX = [
  '/api/session.list',
  '/api/events.mux',
  '/api/pair/accept',
  '/api/update/status',
  '/api/dsh-desktop-launcher/shutdown',
  '/api/dsh-web-ui-settings/mutate',
  '/sidebar/api/fs.tree',
  '/sidebar',
  '/git/api/status',
  '/git',
  '/pet/whale/sprite.webp',
  '/pet',
  '/m/api/session.list',
  '/assets/index.js',
]

const WS_MATRIX = [
  '/api/events.mux',
  '/api/events.host',
  '/sidebar/ws/terminal',
  '/sidebar/ws/agent-terminals',
  '/api/dsh-ssh/terminal',
  '/api/session.list',
  '/m/api/events.mux',
]

interface FakeWindow {
  fetch: (input: unknown, init?: unknown) => Promise<Response>
  WebSocket: unknown
  EventSource?: unknown
  location: { origin: string; href: string; hostname: string }
  [REMOTE_CHANNEL_BOOT_GLOBAL]?: RemoteChannelBootSeat
  calls: string[]
  wsUrls: string[]
  response: () => Response
}

function makeWindow(hostname = '192.168.1.20', port = '3080'): FakeWindow {
  const origin = `http://${hostname}:${port}`
  const win: FakeWindow = {
    location: { origin, href: `${origin}/`, hostname },
    calls: [],
    wsUrls: [],
    response: () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
    fetch(input: unknown) {
      const raw = typeof input === 'string' || input instanceof URL ? input.toString() : (input as Request).url
      win.calls.push(new URL(raw, win.location.href).href)
      return Promise.resolve(win.response())
    },
    WebSocket: class {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3
      constructor(url: unknown) {
        win.wsUrls.push(new URL(String(url), win.location.href).href)
      }
    },
  }
  return win
}

/** Evaluate the generated script against the fake window. */
function boot(win: FakeWindow, script = buildRemoteChannelBootScript()): void {
  new Function('window', script)(win)
}

describe('remote channel boot patch (issue #987)', () => {
  it('contains no script-closing sequence and embeds the live rules', () => {
    const script = buildRemoteChannelBootScript()
    expect(script).not.toContain('</script')
    expect(script).toContain('/api/pair/')
    expect(script).toContain('/api/events.mux')
  })

  it('renders into the head ahead of the module scripts (parse-time install)', () => {
    const html = '<html><head><script type="module" src="/assets/index.js"></script></head><body></body></html>'
    const rendered = renderIndexInjections(html, [{ kind: 'script', placement: 'head', text: REMOTE_CHANNEL_BOOT_SCRIPT }])
    const bootAt = rendered.indexOf('__DSH_REMOTE_CHANNEL_BOOT__')
    const moduleAt = rendered.indexOf('type="module"')
    expect(bootAt).toBeGreaterThan(-1)
    expect(bootAt).toBeLessThan(moduleAt)
  })

  it('does nothing on loopback origins', () => {
    for (const hostname of ['localhost', '127.0.0.1', '127.1.2.3']) {
      const win = makeWindow(hostname)
      const originalFetch = win.fetch
      boot(win)
      expect(win.fetch).toBe(originalFetch)
      expect(win[REMOTE_CHANNEL_BOOT_GLOBAL]).toBeUndefined()
    }
  })

  it('rewrites fetch paths exactly like the browser patch', async () => {
    const win = makeWindow()
    boot(win)
    for (const path of PATH_MATRIX) {
      await win.fetch(path, { method: 'POST' })
    }
    win.calls.forEach((called, i) => {
      const path = PATH_MATRIX[i]
      const expected = shouldRewriteFetchPath(path)
        ? `http://192.168.1.20:3080/remote${path}`
        : `http://192.168.1.20:3080${path}`
      expect(called, path).toBe(expected)
    })
  })

  it('rewrites WebSocket paths exactly like the browser patch', () => {
    const win = makeWindow()
    boot(win)
    for (const path of WS_MATRIX) {
      // eslint-disable-next-line no-new
      new (win.WebSocket as new (url: string) => unknown)(`ws://192.168.1.20:3080${path}`)
    }
    win.wsUrls.forEach((called, i) => {
      const path = WS_MATRIX[i]
      const expected = shouldRewriteWsPath(path)
        ? `ws://192.168.1.20:3080/remote${path}`
        : `ws://192.168.1.20:3080${path}`
      expect(called, path).toBe(expected)
    })
  })

  it('records an unpaired signal before adoption and replays it via the seat', async () => {
    const win = makeWindow()
    win.response = () => new Response(JSON.stringify({
      type: 'server-response',
      result: { ok: false, error: { code: 'unpaired', message: 'not paired' } },
    }), { status: 403, headers: { 'content-type': 'application/json' } })
    boot(win)
    const seat = win[REMOTE_CHANNEL_BOOT_GLOBAL]
    expect(seat).toBeDefined()
    await win.fetch('/api/session.list', { method: 'POST' })
    // No hooks yet: the signal parks on the seat instead of being lost.
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(seat!.pendingUnpaired).toBe(true)
    let unpaired = 0
    seat!.onUnpaired = () => { unpaired += 1 }
    // Adoption replays: the client apply flushes the pending flag.
    if (seat!.pendingUnpaired) {
      seat!.pendingUnpaired = false
      seat!.onUnpaired()
    }
    expect(unpaired).toBe(1)
  })

  it('reports paired responses through the adopted hook', async () => {
    const win = makeWindow()
    boot(win)
    const seat = win[REMOTE_CHANNEL_BOOT_GLOBAL]!
    let paired = 0
    seat.onPaired = () => { paired += 1 }
    await win.fetch('/api/session.list', { method: 'POST' })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(paired).toBe(1)
  })

  it('restore() unpatches everything and removes the global', async () => {
    const win = makeWindow()
    const originalFetch = win.fetch
    const OriginalWebSocket = win.WebSocket
    boot(win)
    expect(win.fetch).not.toBe(originalFetch)
    const seat = win[REMOTE_CHANNEL_BOOT_GLOBAL]!
    seat.restore()
    expect(win.fetch).toBe(originalFetch)
    expect(win.WebSocket).toBe(OriginalWebSocket)
    expect(win[REMOTE_CHANNEL_BOOT_GLOBAL]).toBeUndefined()
    await win.fetch('/api/session.list', { method: 'POST' })
    expect(win.calls).toEqual(['http://192.168.1.20:3080/api/session.list'])
  })
})
