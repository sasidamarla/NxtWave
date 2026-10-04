/**
 * AI PROVIDER LAYER WITH FALLBACK
 *
 * Order tried: Gemini first, then Groq. A provider is only used if its key is set,
 * so with just GEMINI_API_KEY this behaves like a single-provider setup.
 *
 * Why a fallback? Free tiers have shared limits. If Gemini is busy (429), erroring (5xx)
 * or slow, we quietly try Groq with the SAME prompt, so the student still gets a score.
 *
 * Rules:
 *  - Provider/network failure  -> move on to the next provider (retrying a busy API is pointless).
 *  - Output we can't parse     -> retry the same provider once, then move on.
 *  - Everything failed         -> throw AiError; the endpoint shows a friendly message.
 *
 * API KEYS: never paste them in this file (they'd end up on GitHub).
 * Put them in .env (and Vercel env vars): GEMINI_API_KEY=...   GROQ_API_KEY=...
 */
import { SYSTEM_PROMPT, buildUserMessage, parseModelOutput, mockScore } from './rubric.js'
import { isProd } from './http.js'

export class AiError extends Error {}

// TIME BUDGETS (they must fit inside each other, like nesting dolls):
//   one provider call   <= 12s
//   all AI work         <= 28s   (each call's timeout is capped by what's left of this budget)
//   + saving to Sheet   <= 10s   (api/_lib/sheets.js)   => worst case ~38s
//   browser gives up at  55s     (src/pages/Submit.jsx)   -> the server always answers first
//   Vercel kills the function at 60s (vercel.json)
const CALL_TIMEOUT_MS = 12000
const TOTAL_BUDGET_MS = 28000
const MIN_USEFUL_CALL_MS = 3000 // don't start a call with less time left than this

// ---------- Provider 1: Google Gemini ----------
async function callGemini(submission, timeoutMs) {
  // Check exact model names in Google AI Studio; they change over time.
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY, // read from .env, not written here
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: buildUserMessage(submission) }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048, // generous: some Gemini models "think" first and that uses tokens
        responseMimeType: 'application/json',
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  await assertOk(res, 'gemini')

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts // Gemini nests the text here
  return Array.isArray(parts) ? parts.map((p) => p.text || '').join('') : undefined
}

// ---------- Provider 2: Groq (OpenAI-compatible chat format) ----------
async function callGroq(submission, timeoutMs) {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.GROQ_API_KEY}`, // read from .env, not written here
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(submission) },
      ],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  await assertOk(res, 'groq')

  const data = await res.json()
  return data?.choices?.[0]?.message?.content // OpenAI-style reply location
}

async function assertOk(res, name) {
  if (res.ok) return
  // Log details for YOU (server logs); never send provider errors to the student.
  const detail = await res.text().catch(() => '')
  console.error(`[ai:${name}] provider error`, res.status, detail.slice(0, 300))
  throw new AiError(`${name} status ${res.status}`)
}

function activeProviders() {
  const list = []
  if (process.env.GEMINI_API_KEY) list.push({ name: 'gemini', call: callGemini })
  if (process.env.GROQ_API_KEY) list.push({ name: 'groq', call: callGroq })
  return list
}

export async function scoreSubmission(submission) {
  const providers = activeProviders()

  // Local development without keys (or MOCK_AI=1): use the rule-based stand-in.
  if (process.env.MOCK_AI === '1' || (providers.length === 0 && !isProd())) {
    return mockScore(submission)
  }
  if (providers.length === 0) throw new AiError('No AI key is set (GEMINI_API_KEY or GROQ_API_KEY)')

  const startedAt = Date.now()
  const failures = []

  for (const provider of providers) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt)
      if (remaining < MIN_USEFUL_CALL_MS) {
        failures.push(`${provider.name}: out of time`)
        break
      }

      let text
      try {
        text = await provider.call(submission, Math.min(CALL_TIMEOUT_MS, remaining))
      } catch (err) {
        // Busy, down, slow or bad key: don't retry this provider, try the next one.
        failures.push(`${provider.name}: ${err.message}`)
        console.warn(`[ai] ${provider.name} failed, trying next provider:`, err.message)
        break
      }

      try {
        const result = parseModelOutput(text)
        console.info(`[ai] scored with ${provider.name}`)
        return result
      } catch (err) {
        failures.push(`${provider.name}: unparseable (${err.message})`)
        console.warn(`[ai] ${provider.name} parse failed (attempt ${attempt}):`, err.message)
        // loop again: one retry on the same provider, then move on
      }
    }
  }

  throw new AiError(`All providers failed: ${failures.join(' | ')}`)
}
