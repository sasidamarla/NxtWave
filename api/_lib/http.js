// Folders/files starting with "_" inside /api are NOT exposed as endpoints on Vercel.
// That makes _lib the right place for helpers shared by several endpoints.

/** Best-effort client IP. Vercel puts the real one first in x-forwarded-for. */
export function getIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

/** Vercel parses JSON bodies for us, but be safe if we get a raw string or nothing. */
export function getBody(req) {
  const b = req.body
  if (b && typeof b === 'object') return b
  if (typeof b === 'string') {
    try {
      return JSON.parse(b)
    } catch {
      return {}
    }
  }
  return {}
}

export const isProd = () => process.env.NODE_ENV === 'production'
