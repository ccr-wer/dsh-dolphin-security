/**
 * The try-on plugin's browser half: the dsh-market.com deep link and toolbar.
 *
 * Everything here rides the real skin runtime. The skin-center client bundle
 * is a sibling row in the same client module table, so this module requires it
 * by package id (dynamically, so the bundler never resolves it) and calls its
 * public bootSkinRuntime: catalog, activation, hooks, theme repaint — all
 * the code that runs on a machine, with the only difference being where the
 * assets come from (the market's static copy, served by the host half).
 *
 * The toolbar is plain DOM on purpose: it must never depend on the surface's
 * renderer, and the only styling contract it needs is the token set every skin
 * (and the stock theme) defines.
 */

import type { Context } from '@deepseek-ai/cordis'

/** The skin-center client module id, referenced dynamically. */
const SKIN_CENTER_SOURCE = '@linxin666/dsh-client-ui-skin-center'

/** Services this half waits on. */
export const inject = ['theme']

interface SkinRuntime {
  refreshCatalog(): Promise<void>
  catalog(): unknown[]
  find(id: string): unknown
  controller: { switchTo(id: string | null, entry: unknown | null): Promise<unknown> }
}

interface ThemeLike {
  setTheme(id: string): void
}

/** The theme service, when present (the module waited on it, so it usually is). */
function themeService(ctx: Context): ThemeLike | undefined {
  try {
    return (ctx as unknown as { get: (name: string) => ThemeLike | undefined }).get('theme')
  } catch {
    return undefined
  }
}

function isDark(): boolean {
  return document.body?.hasAttribute('data-ds-dark-theme') === true
}

function requireSkinCenter(): unknown | undefined {
  try {
    return (require as unknown as (spec: string) => unknown)(SKIN_CENTER_SOURCE)
  } catch {
    return undefined
  }
}

/** Wait until the skin-center row registered its factory in the module table. */
async function waitForSkinCenter(): Promise<unknown | undefined> {
  for (let attempt = 0; attempt < 80; attempt++) {
    const mod = requireSkinCenter()
    if (mod !== undefined) return mod
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return undefined
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] {
  return document.createElement(tag)
}

function currentSkinId(): string | null {
  return document.documentElement?.getAttribute('data-dsh-skin') ?? null
}

const TOOLBAR_CSS = [
  '.dsh-tryon-toolbar{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2147483000;',
  ' display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:999px;',
  ' border:1px solid var(--dsw-alias-border-l2,#0000001a);',
  ' background:var(--dsw-alias-bg-layer-2,rgba(255,255,255,.92));',
  ' color:var(--dsw-alias-label-primary,#1b1b1c);',
  ' font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;',
  ' box-shadow:0 10px 32px rgba(0,0,0,.16);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}',
  '.dsh-tryon-toolbar a{color:inherit;text-decoration:none;white-space:nowrap}',
  '.dsh-tryon-toolbar a:hover{text-decoration:underline}',
  '.dsh-tryon-back{font-weight:600}',
  '.dsh-tryon-toolbar select{max-width:180px;padding:4px 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l3,#0000001f);',
  ' background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font:inherit}',
  '.dsh-tryon-toggle{display:flex;border:1px solid var(--dsw-alias-border-l3,#0000001f);border-radius:8px;overflow:hidden}',
  '.dsh-tryon-toggle button{border:0;padding:4px 10px;background:transparent;color:inherit;font:inherit;cursor:pointer}',
  '.dsh-tryon-toggle button[aria-pressed="true"]{background:var(--dsw-alias-interactive-bg-active,#2631481a)}',
  '.dsh-tryon-toolbar .dsh-tryon-muted{color:var(--dsw-alias-label-tertiary,#81858c);font-size:12px}',
  '@media (max-width:640px){.dsh-tryon-toolbar{left:12px;right:12px;transform:none;flex-wrap:wrap;justify-content:center;border-radius:16px}}',
].join('')

/** Mount the browser half. */
export function apply(ctx: Context): void {
  void run(ctx)
}

async function run(ctx: Context): Promise<void> {
  const params = new URLSearchParams(location.search)
  const wantedSkin = params.get('skin')
  const wantedTheme = params.get('theme')

  const theme = themeService(ctx)
  if (wantedTheme === 'light' || wantedTheme === 'dark') {
    try {
      theme?.setTheme(wantedTheme)
    } catch {
      /* fall through: the runtime still applies the skin */
    }
  }

  const mod = await waitForSkinCenter()
  if (mod === undefined) {
    renderNotice('皮肤试穿模块加载失败，请刷新重试。')
    return
  }
  const skinCenter = mod as { bootSkinRuntime(options?: object): SkinRuntime }
  const store = skinCenter.bootSkinRuntime({})

  // Point the runtime's initial selection at the deep link before its own
  // restore pass reads the attribute (it runs after this synchronous frame).
  if (wantedSkin !== null && wantedSkin !== '') {
    document.documentElement.setAttribute('data-dsh-skin', wantedSkin)
  }

  try {
    await store.refreshCatalog()
  } catch {
    /* the toolbar still renders with an empty picker */
  }
  if (wantedSkin !== null && wantedSkin !== '') {
    // Best-effort persistence so a reload restores the same skin.
    void fetch('/api/skin-center/v2/active', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ active: wantedSkin }),
    }).catch(() => {})
  }

  renderToolbar(store, theme)
}

function renderToolbar(store: SkinRuntime, theme: ThemeLike | undefined): void {
  if (document.getElementById('dsh-tryon-chrome') !== null) return
  const style = el('style')
  style.id = 'dsh-tryon-chrome'
  style.textContent = TOOLBAR_CSS
  document.head.append(style)

  const bar = el('div')
  bar.className = 'dsh-tryon-toolbar'
  bar.dataset.dshMarket = 'tryon'

  const back = el('a')
  back.href = new URL('../', location.href).href
  back.textContent = '◀ 市场'
  back.title = '返回 dsh-market.com'
  bar.append(back)

  const select = el('select')
  select.setAttribute('aria-label', '选择皮肤')
  const active = currentSkinId()
  refreshOptions(select, store, active)
  select.addEventListener('change', () => {
    const id = select.value
    if (id === '') return
    const entry = store.find(id)
    if (entry === null) return
    void store.controller.switchTo(id, entry).then(() => {
      const link = bar.querySelector<HTMLAnchorElement>('.dsh-tryon-download')
      if (link !== null) link.href = downloadUrl(id)
    }).catch(() => {})
  })
  bar.append(select)

  const toggle = el('div')
  toggle.className = 'dsh-tryon-toggle'
  const light = el('button')
  light.textContent = '亮'
  light.setAttribute('aria-pressed', String(!isDark()))
  const dark = el('button')
  dark.textContent = '暗'
  dark.setAttribute('aria-pressed', String(isDark()))
  light.addEventListener('click', () => {
    try { theme?.setTheme('light') } catch { /* body-attr fallback below */ }
    document.body.removeAttribute('data-ds-dark-theme')
    light.setAttribute('aria-pressed', 'true')
    dark.setAttribute('aria-pressed', 'false')
  })
  dark.addEventListener('click', () => {
    try { theme?.setTheme('dark') } catch { /* body-attr fallback below */ }
    document.body.setAttribute('data-ds-dark-theme', '')
    dark.setAttribute('aria-pressed', 'true')
    light.setAttribute('aria-pressed', 'false')
  })
  toggle.append(light, dark)
  bar.append(toggle)

  const dl = el('a')
  dl.className = 'dsh-tryon-download'
  dl.target = '_blank'
  dl.rel = 'noopener'
  dl.textContent = '下载'
  dl.title = '下载该皮肤文件包'
  if (active !== null) dl.href = downloadUrl(active)
  bar.append(dl)

  document.body.append(bar)
}

function refreshOptions(select: HTMLSelectElement, store: SkinRuntime, active: string | null): void {
  const items = (store.catalog() ?? []) as { manifest?: { id?: unknown; name?: unknown; nameEn?: unknown; order?: unknown } }[]
  const sorted = [...items]
    .filter((s) => typeof s.manifest?.id === 'string')
    .sort((a, b) => {
      const no = typeof a.manifest?.order === 'number' ? a.manifest.order : Number.MAX_SAFE_INTEGER
      const nb = typeof b.manifest?.order === 'number' ? b.manifest.order : Number.MAX_SAFE_INTEGER
      if (no !== nb) return no - nb
      return String(a.manifest?.id).localeCompare(String(b.manifest?.id))
    })
  select.textContent = ''
  const stock = el('option')
  stock.value = ''
  stock.textContent = '默认外观'
  select.append(stock)
  for (const s of sorted) {
    const opt = el('option')
    opt.value = String(s.manifest?.id)
    const name = typeof s.manifest?.name === 'string' ? s.manifest.name : String(s.manifest?.id)
    const nameEn = typeof s.manifest?.nameEn === 'string' ? s.manifest.nameEn : ''
    opt.textContent = nameEn !== '' ? name + ' · ' + nameEn : name
    select.append(opt)
  }
  if (active !== null) select.value = active
}

function downloadUrl(id: string): string {
  return new URL('../assets/skins/' + encodeURIComponent(id) + '.zip', location.href).href
}

function renderNotice(text: string): void {
  const style = el('style')
  style.textContent = '.dsh-tryon-error{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:2147483000;padding:10px 18px;border-radius:12px;background:#ec13131a;border:1px solid var(--dsw-alias-state-error-primary,#ec1313);color:var(--dsw-alias-state-error-primary,#ec1313);font:13px/1.5 sans-serif}'
  document.head.append(style)
  const box = el('div')
  box.className = 'dsh-tryon-error'
  box.textContent = text
  document.body.append(box)
}

export default { apply, inject }
