/**
 * Bounded JSON body reader for the edge API. Every unauthenticated POST
 * handler caps its body: the Content-Length fast path rejects before
 * reading, and the post-read length check bounds parsing cost when the
 * header is absent or lies (the isolate still buffers the body in memory,
 * so the cap limits parse/CPU, not isolate buffering).
 */

/**
 * Read and parse a JSON body no larger than maxBytes.
 * Returns { ok: true, value } or { ok: false, error } where error is
 * 'payload-too-large' (413) or 'invalid-json' (400).
 */
export async function readJsonCapped(request, maxBytes) {
  const declared = Number(request.headers.get('content-length') || '')
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, error: 'payload-too-large' }
  let text
  try { text = await request.text() } catch { return { ok: false, error: 'invalid-json' } }
  if (text.length > maxBytes) return { ok: false, error: 'payload-too-large' }
  try { return { ok: true, value: JSON.parse(text) } } catch { return { ok: false, error: 'invalid-json' } }
}
