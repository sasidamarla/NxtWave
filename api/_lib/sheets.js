/**
 * STORAGE via a Google Apps Script "web app" attached to a Google Sheet.
 * (Setup steps: docs/apps-script.gs and README.)
 *
 * Why go through our own /api instead of calling the Apps Script URL from the
 * browser? The URL + secret stay private on the server, and we can validate and
 * rate-limit first.
 */
import { isProd } from './http.js'

// Local-dev fallback so you can test the whole flow (duplicates, full event, repeat
// lucky-draw entries) without setting up a Sheet. Lives only in memory.
const devRegistered = new Set()
const devSubmitters = new Set()

export const sheetsConfigured = () => Boolean(process.env.SHEETS_WEBHOOK_URL)

/** Test helper: wipe the in-memory dev store. */
export function resetDevStore() {
  devRegistered.clear()
  devSubmitters.clear()
}

export async function sendToSheet(payload) {
  const url = process.env.SHEETS_WEBHOOK_URL

  if (!url) {
    if (isProd()) throw new Error('SHEETS_WEBHOOK_URL is not set')
    return devFallback(payload)
  }

  const res = await fetch(url, {
    method: 'POST',
    // text/plain avoids a CORS preflight that Apps Script can't answer.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, secret: process.env.SHEETS_SECRET }),
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Sheet returned non-JSON (status ${res.status})`)
  }
  if (!data.ok) throw new Error(`Sheet error: ${data.error || 'unknown'}`)
  return data
}

function devFallback(payload) {
  console.warn('[sheets] SHEETS_WEBHOOK_URL not set: using in-memory dev store.')

  if (payload.type === 'register') {
    // Same order as the Apps Script: duplicate check first, then capacity.
    if (devRegistered.has(payload.email)) return { ok: true, duplicate: true, simulated: true }
    if (payload.maxSeats && devRegistered.size >= payload.maxSeats) {
      return { ok: true, full: true, simulated: true }
    }
    devRegistered.add(payload.email)
    console.log('[sheets:dev] register', payload.email)
    return { ok: true, duplicate: false, simulated: true }
  }

  if (payload.type === 'submission') {
    const firstEntry = !devSubmitters.has(payload.email)
    devSubmitters.add(payload.email)
    console.log('[sheets:dev] submission', payload.email, payload.overall, firstEntry ? '(first entry)' : '(repeat)')
    return { ok: true, firstEntry, simulated: true }
  }

  return { ok: true, simulated: true }
}
