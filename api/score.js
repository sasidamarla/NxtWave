/**
 * POST /api/score
 * Validates the submission, asks the AI to score it, saves it for the lucky draw,
 * and returns the result. API keys are read from process.env on the SERVER ONLY.
 *
 * LUCKY-DRAW RULE: one entry per email. Every scored attempt is saved (so you can see
 * activity), but only the FIRST one per email counts as the draw entry. The Sheet script
 * decides that and tells us in `firstEntry`.
 */
import { validateSubmission } from '../shared/validation.js'
import { scoreSubmission } from './_lib/ai.js'
import { getBody, getIp } from './_lib/http.js'
import { rateLimit } from './_lib/rateLimit.js'
import { sendToSheet } from './_lib/sheets.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })

  // Scoring uses limited AI quota, so this limit is stricter than registration.
  if (!rateLimit(`score:${getIp(req)}`, 5, 10 * 60 * 1000)) {
    return res.status(429).json({
      error: 'You’ve scored a few projects already. Please wait a few minutes and try again.',
    })
  }

  const body = getBody(req)
  if (body.company_website) return res.status(200).json({ ok: true }) // honeypot

  const { ok, errors, clean } = validateSubmission(body)
  if (!ok) return res.status(400).json({ error: 'Please fix the highlighted fields.', errors })

  // 1) Score
  let result
  try {
    result = await scoreSubmission(clean)
  } catch (err) {
    console.error('[score] AI failed:', err.message)
    return res.status(502).json({
      error: 'Our AI mentor had a hiccup. Your project wasn’t lost, please try again.',
    })
  }

  // 2) Save for the lucky draw. If saving fails we still show the score (the student
  //    did the work), but we tell them honestly that their entry wasn't recorded.
  let entered = true
  let repeat = false
  try {
    const saved = await sendToSheet({
      type: 'submission',
      ...clean,
      overall: result.overall,
      scores: result.scores,
      source: typeof body.source === 'string' ? body.source.slice(0, 40) : 'direct',
    })
    repeat = saved.firstEntry === false
  } catch (err) {
    console.error('[score] save failed:', err.message)
    entered = false
  }

  return res.status(200).json({ ok: true, result, luckyDraw: { entered, repeat } })
}
