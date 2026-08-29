/**
 * The try-on plugin's host half.
 *
 * The market's skin-center client bundle is unmodified, so it speaks the same
 * HTTP contract it speaks on a real machine: GET /api/skin-center/v2/catalog,
 * GET /active, POST /active, GET /skins/<id>/{stylesheet,patches,hooks.mjs,
 * assets/*,preview/*}. On a real dsh the skin-center plugin serves those from
 * the filesystem; here there is no filesystem, so this half serves them from
 * the market's static assets on the same origin (../assets/skins/<id>/, a copy
 * of the entire skin directory, manifest included).
 *
 * That is the whole point of the try-on shell: the browser half is the real
 * skin runtime, and only the asset source differs — so what the visitor sees
 * is what a local install applies.
 *
 * CSS is pre-transformed during market-build with Skin Center's canonical
 * safety pipeline, so light tokens and scoping match a local installation.
 */

import type { Context } from '@deepseek-ai/cordis'

/** Stable Cordis plugin name. */
export const name = 'web-tryon'

/** Services this row needs: the web route registry this half attaches to. */
export const inject = ['webServer']

const API_PREFIX = '/api/skin-center/v2'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
}

/** The market's skin asset root, relative to this deployment's directory. */
function skinAssetBase(): string {
  return new URL('../assets/skins/', new URL('.', location.href)).href
}

/** The market's catalog manifest (id/order/display fields; not skin.json). */
function skinListUrl(): string {
  return new URL('../manifest/skins.json', new URL('.', location.href)).href
}

interface Catalog {
  ok: boolean
  capturedAt: number
  skins: { origin: string; warnings: string[]; manifest: Record<string, unknown> }[]
  diagnostics: { subject: string; origin: string; errors: string[] }[]
}

let catalogCache: { at: number; value: Catalog } | null = null
let catalogPending: Promise<Catalog> | null = null
const CATALOG_TTL = 300_000

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

/** Snapshot the skin catalog from the market's static assets. */
async function buildCatalog(): Promise<Catalog> {
  const now = Date.now()
  if (catalogCache !== null && now - catalogCache.at < CATALOG_TTL) return catalogCache.value
  if (catalogPending !== null) return catalogPending
  catalogPending = (async () => {
    const diagnostics: Catalog['diagnostics'] = []
    const list = (await fetchJson(skinListUrl())) as { items?: unknown[] } | null
    const items = Array.isArray(list?.items) ? list.items : []
    const loaded = await Promise.all(items.map(async (raw) => {
      const item = raw as { id?: unknown }
      const id = typeof item.id === 'string' ? item.id : ''
      if (id === '') return null
      const manifest = (await fetchJson(skinAssetBase() + encodeURIComponent(id) + '/skin.json')) as Record<string, unknown> | null
      if (manifest === null || typeof manifest.id !== 'string') {
        diagnostics.push({ subject: id, origin: 'builtin', errors: ['skin.json missing or invalid'] })
        return null
      }
      const entry: Catalog['skins'][number] = { origin: 'builtin', warnings: [], manifest }
      return entry
    }))
    const value: Catalog = {
      ok: true,
      capturedAt: Date.now(),
      skins: loaded.filter((entry): entry is Catalog['skins'][number] => entry !== null),
      diagnostics,
    }
    catalogCache = { at: Date.now(), value }
    return value
  })()
  try { return await catalogPending } finally { catalogPending = null }
}

/** Read a JSON request body (bounded at 16KB, like the real route). */
async function readBody(req: unknown): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    const r = req as { on(event: string, cb: (chunk: Uint8Array) => void): void }
    const chunks: Uint8Array[] = []
    let size = 0
    r.on('data', (chunk) => {
      size += chunk.byteLength ?? chunk.length
      if (size > 16 * 1024) {
        reject(new Error('body-too-large'))
        return
      }
      chunks.push(chunk)
    })
    r.on('end', () => {
      if (chunks.length === 0) { resolve({}); return }
      try {
        const total = chunks.reduce((n, c) => n + (c.byteLength ?? c.length), 0)
        const buf = new Uint8Array(total)
        let offset = 0
        for (const c of chunks) { buf.set(c, offset); offset += c.byteLength ?? c.length }
        resolve(JSON.parse(new TextDecoder().decode(buf)))
      } catch {
        reject(new Error('invalid-json'))
      }
    })
  })
}

function json(res: unknown, status: number, body: unknown): void {
  const r = res as { writeHead(code: number, headers: Record<string, string>): void; end(payload: string): void }
  try {
    r.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    r.end(JSON.stringify(body))
  } catch {
    /* response already ended */
  }
}

function serveBytes(res: unknown, status: number, body: Uint8Array, type: string): void {
  const r = res as { writeHead(code: number, headers: Record<string, string>): void; end(payload: Uint8Array | string): void }
  r.writeHead(status, { 'content-type': type, 'cache-control': status === 200 ? 'public, max-age=86400' : 'no-store' })
  r.end(body)
}

/** One skin resource: stylesheet/patches/hooks.mjs/assets/<p>/preview/<p>. */
async function serveSkinResource(res: unknown, rest: string): Promise<void> {
  const parts = rest.split('/')
  const id = parts[0] ?? ''
  const sub = parts.slice(1).join('/')
  if (id === '' || sub === '') {
    json(res, 404, { ok: false, error: 'skin-asset-not-found' })
    return
  }
  if (!/^[a-z][a-z0-9-]{0,31}$/.test(id)) {
    json(res, 404, { ok: false, error: 'skin-not-found' })
    return
  }
  const catalog = await buildCatalog()
  const entry = catalog.skins.find((s) => s.manifest.id === id)
  if (entry === undefined) {
    json(res, 404, { ok: false, error: 'skin-not-found' })
    return
  }
  const contributes = entry.manifest.contributes as { stylesheet?: string; patches?: string } | undefined
  if (sub === 'stylesheet') {
    const rel = contributes?.stylesheet
    if (rel === undefined) { json(res, 404, { ok: false, error: 'stylesheet-not-found' }); return }
    const fetched = await fetch(new URL('../tryon-assets/skins/' + encodeURIComponent(id) + '/skin.css', new URL('.', location.href))).catch(() => null)
    if (fetched === null || !fetched.ok) { json(res, 404, { ok: false, error: 'stylesheet-not-found' }); return }
    serveBytes(res, 200, new TextEncoder().encode(await fetched.text()), 'text/css; charset=utf-8')
    return
  }
  if (sub === 'patches') {
    const rel = contributes?.patches
    if (rel === undefined) { json(res, 404, { ok: false, error: 'no-patches' }); return }
    const fetched = await fetch(new URL('../tryon-assets/skins/' + encodeURIComponent(id) + '/patches.css', new URL('.', location.href))).catch(() => null)
    if (fetched === null || !fetched.ok) { json(res, 404, { ok: false, error: 'no-patches' }); return }
    serveBytes(res, 200, new TextEncoder().encode(await fetched.text()), 'text/css; charset=utf-8')
    return
  }
  if (sub === 'hooks.mjs') {
    const facet = entry.manifest.facets as { client?: { entry?: string } } | undefined
    const rel = facet?.client?.entry
    if (rel === undefined) { json(res, 404, { ok: false, error: 'no-hooks' }); return }
    const fetched = await fetch(skinAssetBase() + encodeURIComponent(id) + '/' + rel).catch(() => null)
    if (fetched === null || !fetched.ok) { json(res, 404, { ok: false, error: 'hooks-not-found' }); return }
    serveBytes(res, 200, new Uint8Array(await fetched.arrayBuffer()), 'text/javascript; charset=utf-8')
    return
  }
  if (sub.startsWith('assets/') || sub.startsWith('preview/')) {
    if (sub.includes('..')) { json(res, 404, { ok: false, error: 'asset-not-found' }); return }
    const url = skinAssetBase() + encodeURIComponent(id) + '/' + sub
    const fetched = await fetch(url).catch(() => null)
    if (fetched === null || !fetched.ok) { json(res, 404, { ok: false, error: 'asset-not-found' }); return }
    const dot = sub.lastIndexOf('.')
    const mime = dot === -1 ? 'application/octet-stream' : (MIME[sub.slice(dot)] ?? 'application/octet-stream')
    serveBytes(res, 200, new Uint8Array(await fetched.arrayBuffer()), mime)
    return
  }
  json(res, 404, { ok: false, error: 'unknown-skin-resource' })
}

/** The active skin selection, kept in this browser (the market never needs more). */
const ACTIVE_KEY = 'dsh-market-tryon:active'

function readActive(): string | null {
  try {
    const v = localStorage.getItem(ACTIVE_KEY)
    return typeof v === 'string' && v !== '' ? v : null
  } catch {
    return null
  }
}

async function handleActive(req: unknown, res: unknown, method: string): Promise<void> {
  if (method === 'GET') {
    json(res, 200, { ok: true, active: readActive() })
    return
  }
  if (method === 'POST') {
    let body: unknown
    try {
      body = await readBody(req)
    } catch {
      json(res, 400, { ok: false, error: 'invalid-body' })
      return
    }
    const active = (body as { active?: unknown }).active
    if (active !== null && typeof active !== 'string') {
      json(res, 400, { ok: false, error: 'active-must-be-string-or-null' })
      return
    }
    if (typeof active === 'string') {
      const catalog = await buildCatalog()
      if (!catalog.skins.some((s) => s.manifest.id === active)) {
        json(res, 404, { ok: false, error: 'skin-not-found' })
        return
      }
    }
    try {
      if (active === null) localStorage.removeItem(ACTIVE_KEY)
      else localStorage.setItem(ACTIVE_KEY, active)
    } catch {
      /* storage unavailable: the session still works */
    }
    json(res, 200, { ok: true, active: active ?? null })
    return
  }
  json(res, 405, { ok: false, error: 'method-not-allowed' })
}

/**
 * Mount the host half: register the same v2 surface the skin-center host
 * serves on a machine, backed by the market's static assets.
 */
export function apply(ctx: Context): void {
  const webServer = (ctx as unknown as { webServer?: { register(route: unknown): void } }).webServer
  if (webServer === undefined) return
  webServer.register({
    kind: 'exact',
    path: API_PREFIX + '/catalog',
    handler: (req: unknown, res: unknown) => {
      void buildCatalog().then((catalog) => json(res, 200, catalog), () => json(res, 500, { ok: false, error: 'catalog-failed' }))
    },
  })
  webServer.register({
    kind: 'exact',
    path: API_PREFIX + '/active',
    handler: (req: unknown, res: unknown) => {
      const method = (req as { method?: string }).method ?? 'GET'
      void handleActive(req, res, method).catch(() => json(res, 500, { ok: false, error: 'active-failed' }))
    },
  })
  webServer.register({
    kind: 'prefix',
    path: API_PREFIX + '/skins',
    handler: (req: unknown, res: unknown) => {
      const url = new URL((req as { url?: string }).url ?? '/', 'http://localhost')
      const rest = url.pathname.slice((API_PREFIX + '/skins/').length)
      void serveSkinResource(res, rest).catch(() => json(res, 500, { ok: false, error: 'skin-resource-failed' }))
    },
  })
}

export default { name, inject, apply }
