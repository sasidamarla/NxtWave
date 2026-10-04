/**
 * Run:  npm run test:fallback
 * Proves the Gemini -> Groq fallback logic WITHOUT real keys or network:
 * we replace fetch with a fake that pretends each provider is healthy, busy or broken.
 */
process.env.MOCK_AI = '0'
process.env.GEMINI_API_KEY = 'fake-gemini'
process.env.GROQ_API_KEY = 'fake-groq'

const { scoreSubmission } = await import('../api/_lib/ai.js')

const GOOD = {
  scores: { functionality: 7, creativity: 6, aiUse: 8, completion: 5 },
  summary: 'Nice work.',
  strengths: ['Clear idea', 'Real problem'],
  nextSteps: ['Add a demo link', 'Explain the AI step'],
  thin_submission: false,
}
const gemini = (text) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 })
const groq = (text) => new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), { status: 200 })
const status = (code) => new Response('{"error":"x"}', { status: code })

const sub = { title: 'Test', link: '', description: 'A project description that is long enough to be scored properly.' }
const originalFetch = globalThis.fetch
const originalError = console.error
const originalWarn = console.warn
const originalInfo = console.info
let pass = 0
let fail = 0

async function scenario(name, behaviour, check) {
  const calls = []
  globalThis.fetch = async (url) => {
    const provider = String(url).includes('googleapis') ? 'gemini' : 'groq'
    calls.push(provider)
    return behaviour[provider](calls.filter((c) => c === provider).length)
  }
  console.error = console.warn = console.info = () => {} // keep output readable
  let outcome
  try {
    outcome = { result: await scoreSubmission(sub) }
  } catch (err) {
    outcome = { error: err }
  }
  console.error = originalError
  console.warn = originalWarn
  console.info = originalInfo

  const ok = check(outcome, calls)
  if (ok) pass++
  else fail++
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}   calls: ${calls.join(' -> ')}`)
}

await scenario(
  'Gemini healthy -> Groq never called',
  { gemini: () => gemini(JSON.stringify(GOOD)), groq: () => groq('{}') },
  (o, c) => o.result?.overall === 67 && c.join() === 'gemini',
)
await scenario(
  'Gemini busy (429) -> falls back to Groq',
  { gemini: () => status(429), groq: () => groq(JSON.stringify(GOOD)) },
  (o, c) => o.result?.overall === 67 && c.join() === 'gemini,groq',
)
await scenario(
  'Gemini returns garbage twice -> retried once, then Groq',
  { gemini: () => gemini('Sorry, I cannot do that.'), groq: () => groq(JSON.stringify(GOOD)) },
  (o, c) => o.result?.overall === 67 && c.join() === 'gemini,gemini,groq',
)
await scenario(
  'Gemini garbage once, then valid -> no fallback needed',
  { gemini: (n) => gemini(n === 1 ? 'nope' : JSON.stringify(GOOD)), groq: () => groq('{}') },
  (o, c) => o.result?.overall === 67 && c.join() === 'gemini,gemini',
)
await scenario(
  'Gemini network error -> Groq',
  { gemini: () => { throw new TypeError('fetch failed') }, groq: () => groq(JSON.stringify(GOOD)) },
  (o, c) => o.result?.overall === 67 && c.join() === 'gemini,groq',
)
await scenario(
  'Both providers down -> AiError (endpoint shows friendly message)',
  { gemini: () => status(503), groq: () => status(500) },
  (o, c) => o.error?.constructor?.name === 'AiError' && c.join() === 'gemini,groq',
)
await scenario(
  'Model replies with fenced JSON + prose -> still parsed',
  { gemini: () => gemini('Here:\n```json\n' + JSON.stringify(GOOD) + '\n```'), groq: () => groq('{}') },
  (o, c) => o.result?.overall === 67 && c.join() === 'gemini',
)

globalThis.fetch = originalFetch
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
