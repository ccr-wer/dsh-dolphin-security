/**
 * Shields.io endpoint badges for the dsh-web npm family. The aggregate
 * package was renamed from @linxin666/dsh-web-ui-all to @linxin666/dsh-web-all
 * (dual-published for two releases, then the legacy name is deprecated), so
 * badge numbers must cover both names — shields' native npm badges cannot sum
 * packages and 404 on the new name until its first publish. Numbers come from
 * the public npm API at request time, cached briefly per isolate.
 */

const PACKAGES = ['@linxin666/dsh-web-all', '@linxin666/dsh-web-ui-all']
/**
 * Every published family package (current names plus both aggregate names).
 * Used by the all-time cumulative downloads badge; summing counts aggregate
 * dependency pulls too, which is the standard "total npm downloads" badge
 * convention.
 */
const FAMILY_PACKAGES = [
  '@linxin666/dsh-web-all', '@linxin666/dsh-web-ui-all',
  '@linxin666/dsh-chat-recovery', '@linxin666/dsh-client-ui-community-plugins',
  '@linxin666/dsh-client-ui-git-graph', '@linxin666/dsh-client-ui-market',
  '@linxin666/dsh-client-ui-plugin-manager', '@linxin666/dsh-client-ui-session-id',
  '@linxin666/dsh-client-ui-skill-explorer', '@linxin666/dsh-client-ui-skin-center',
  '@linxin666/dsh-client-ui-task-board', '@linxin666/dsh-client-ui-web-ui-settings',
  '@linxin666/dsh-desktop-launcher', '@linxin666/dsh-doctor', '@linxin666/dsh-liangshen',
  '@linxin666/dsh-pet', '@linxin666/dsh-remote-web-ui', '@linxin666/dsh-ssh',
  '@linxin666/dsh-tool-describe-image',
]
const TTL_MS = 60 * 60 * 1000
const BADGE_CACHE = { 'cache-control': 'public, max-age=1800' }
/** Batch endpoint cache: one entry per served plugin manifest generation. */
const DOWNLOADS_CACHE = { 'cache-control': 'public, max-age=1800, stale-while-revalidate=3600' }

let cache = { at: 0, downloads: null, version: null }
let totalCache = { at: 0, total: null }
let pluginDownloadsCache = { at: 0, key: '', downloads: null }

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}

function formatDownloads(n) {
  const trim = (v) => String(Math.round(v * 10) / 10)
  if (n >= 1e6) return trim(n / 1e6) + 'm/month'
  if (n >= 1e3) return trim(n / 1e3) + 'k/month'
  return String(n) + '/month'
}

/** Last-30d npm download count for exactly one package, or null when npm has no data. */
async function packageDownloads(pkg) {
  const data = await fetchJson('https://api.npmjs.org/downloads/point/last-month/' + encodeURIComponent(pkg))
  return data && Number.isFinite(data.downloads) ? data.downloads : null
}

/** Compact all-time count, e.g. 12.3k / 1.4m. */
function formatTotal(n) {
  const trim = (v) => String(Math.round(v * 10) / 10)
  if (n >= 1e6) return trim(n / 1e6) + 'm'
  if (n >= 1e3) return trim(n / 1e3) + 'k'
  return String(n)
}

/** All-time cumulative downloads across the whole family (npm range API). */
async function totalDownloads() {
  const now = Date.now()
  if (now - totalCache.at < TTL_MS && totalCache.total !== null) return totalCache.total
  const sums = await Promise.all(FAMILY_PACKAGES.map(async (pkg) => {
    const data = await fetchJson('https://api.npmjs.org/downloads/range/2000-01-01:2100-01-01/' + encodeURIComponent(pkg))
    if (!data || !Array.isArray(data.downloads)) return null
    return data.downloads.reduce((sum, day) => sum + (Number(day.downloads) || 0), 0)
  }))
  let total = null
  for (const sum of sums) {
    if (sum !== null) total = (total || 0) + sum
  }
  totalCache = { at: now, total }
  return total
}

/** Compare two clean vX.Y.Z versions; returns positive when a > b. */
function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map((s) => Number.parseInt(s, 10) || 0)
  const pb = String(b).replace(/^v/, '').split('.').map((s) => Number.parseInt(s, 10) || 0)
  for (let i = 0; i < 3; i++) { if (pa[i] !== pb[i]) return pa[i] - pb[i] }
  return 0
}

async function totals() {
  const now = Date.now()
  if (now - cache.at < TTL_MS && (cache.downloads !== null || cache.version !== null)) return cache
  const enc = (p) => encodeURIComponent(p)
  const [dls, vers] = await Promise.all([
    Promise.all(PACKAGES.map((p) => fetchJson('https://api.npmjs.org/downloads/point/last-month/' + enc(p)))),
    Promise.all(PACKAGES.map((p) => fetchJson('https://registry.npmjs.org/' + enc(p) + '/latest'))),
  ])
  let downloads = null
  for (const d of dls) {
    if (d && Number.isFinite(d.downloads)) downloads = (downloads || 0) + d.downloads
  }
  let version = null
  for (const v of vers) {
    if (v && typeof v.version === 'string' && (version === null || compareVersions(v.version, version) > 0)) version = v.version
  }
  cache = { at: now, downloads, version }
  return cache
}

/** kind is 'downloads' | 'version' | 'total'; json is the worker's JSON responder. */
/**
 * Batch last-30d npm downloads for every plugin in the served manifest.
 * The manifest-derived package list is the allowlist: no query parameter ever
 * drives an upstream lookup. Unpublishable or unlisted packages stay null,
 * and the whole batch cache-lines on the manifest generation.
 */
export async function handleNpmDownloads(env, json) {
  const read = async (path) => {
    const res = await env.ASSETS.fetch(new URL(path, 'https://dsh-market.com/'))
    if (!res || res.status !== 200) return null
    return res.json().catch(() => null)
  }
  const manifest = await read('/manifest/plugins.json')
  if (!manifest || !Array.isArray(manifest.items)) return json({ ok: false, error: 'downloads-unavailable' }, 503)
  const packages = []
  for (const item of manifest.items) {
    if (item && typeof item.npm === 'string' && item.npm && !packages.includes(item.npm)) packages.push(item.npm)
  }
  if (packages.length === 0) return json({ ok: true, generatedAt: new Date().toISOString(), ttlSeconds: 3600, downloads: {} }, 200, DOWNLOADS_CACHE)
  const key = JSON.stringify(packages)
  const now = Date.now()
  if (now - pluginDownloadsCache.at < TTL_MS && pluginDownloadsCache.key === key && pluginDownloadsCache.downloads !== null) {
    return json({ ok: true, generatedAt: new Date(pluginDownloadsCache.at).toISOString(), ttlSeconds: TTL_MS / 1000, downloads: pluginDownloadsCache.downloads }, 200, DOWNLOADS_CACHE)
  }
  const values = await Promise.all(packages.map((pkg) => packageDownloads(pkg)))
  const downloads = {}
  packages.forEach((pkg, index) => { if (values[index] !== null) downloads[pkg] = values[index] })
  pluginDownloadsCache = { at: now, key, downloads }
  return json({ ok: true, generatedAt: new Date(now).toISOString(), ttlSeconds: TTL_MS / 1000, downloads }, 200, DOWNLOADS_CACHE)
}

export async function handleNpmBadge(kind, json) {
  if (kind === 'total') {
    const total = await totalDownloads()
    if (total === null) return json({ schemaVersion: 1, label: 'downloads', message: 'unavailable', color: 'lightgrey' }, 200, BADGE_CACHE)
    return json({ schemaVersion: 1, label: 'downloads', message: formatTotal(total) + ' total', color: 'blue', namedLogo: 'npm' }, 200, BADGE_CACHE)
  }
  const data = await totals()
  if (kind === 'downloads') {
    if (data.downloads === null) return json({ schemaVersion: 1, label: 'downloads', message: 'unavailable', color: 'lightgrey' }, 200, BADGE_CACHE)
    return json({ schemaVersion: 1, label: 'downloads', message: formatDownloads(data.downloads), color: 'blue', namedLogo: 'npm' }, 200, BADGE_CACHE)
  }
  if (data.version === null) return json({ schemaVersion: 1, label: 'npm', message: 'unavailable', color: 'lightgrey' }, 200, BADGE_CACHE)
  return json({ schemaVersion: 1, label: 'npm', message: 'v' + data.version, color: 'blue', namedLogo: 'npm' }, 200, BADGE_CACHE)
}
