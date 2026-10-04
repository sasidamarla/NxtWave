/**
 * POST /api/register
 * Flow: method -> rate limit -> honeypot -> validate -> closed? -> save (+ capacity check) -> respond.
 * Order matters: the cheapest checks run first, so bad traffic costs us the least.
 */
import { validateRegistration } from '../shared/validation.js'
import { maxSeats, registrationClosed } from '../shared/event.js'
import { getBody, getIp } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { sendToSheet } from './_lib/sheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })

  if (!rateLimit(`register:${getIp(req)}`, 10, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' })
  }

  const body = getBody(req)

  // Honeypot: a hidden field real people never fill. Bots do. Pretend success, save nothing.
  if (body.company_website) return res.status(200).json({ ok: true })

  const { ok, errors, clean } = validateRegistration(body)
  if (!ok) return res.status(400).json({ error: 'Please fix the highlighted fields.', errors })

  // The page hides the form after the deadline, but anyone can call this endpoint directly.
  if (registrationClosed()) {
    return res.status(403).json({ error: 'Registration for this workshop has closed.', code: 'closed' })
  }

  const source = typeof body.source === 'string' ? body.source.slice(0, 40) : 'direct'

  try {
    // maxSeats goes to the Sheet script, which counts rows and refuses when full.
    // (It checks duplicates first, so someone already registered still gets a friendly answer.)
    const result = await sendToSheet({ type: 'register', ...clean, source, maxSeats: maxSeats() })

    if (result.full) {
      return res.status(409).json({ error: 'All seats are taken. Thank you for your interest!', code: 'full' })
    }
    return res.status(200).json({ ok: true, duplicate: Boolean(result.duplicate) })
  } catch (err) {
    console.error('[register] save failed:', err.message)
    return res.status(502).json({
      error: 'We couldn’t save your registration just now. Please try again in a minute.',
    })
  }
}
