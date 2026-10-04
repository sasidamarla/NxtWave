/**
 * GET /api/stats
 * Tells the page: is registration closed, and how many seats are taken?
 *  - count: the REAL number of registrations if a Sheet is connected (cached 60s).
 *  - simulated: true when no Sheet is connected, so the page labels its counter honestly.
 *  - closed: computed fresh on every request from the server clock.
 */
import { maxSeats, registrationClosed } from '../shared/event.js'
import { sendToSheet, sheetsConfigured } from './_lib/sheets.js'

let cache = { count: null, at: 0 }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })
  res.setHeader?.('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

  const base = { closed: registrationClosed(), total: maxSeats() }

  if (!sheetsConfigured()) return res.status(200).json({ ...base, simulated: true })

  if (cache.count !== null && Date.now() - cache.at < 60 * 1000) {
    return res.status(200).json({ ...base, simulated: false, count: cache.count })
  }

  try {
    const { count } = await sendToSheet({ type: 'count' })
    cache = { count, at: Date.now() }
    return res.status(200).json({ ...base, simulated: false, count })
  } catch (err) {
    console.error('[stats] failed:', err.message)
    return res.status(200).json({ ...base, simulated: true })
  }
}
