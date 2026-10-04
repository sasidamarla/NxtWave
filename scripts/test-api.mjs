/**
 * Run:  npm run test:api
 * Calls the real handlers in api/*.js with fake request/response objects (no server, no keys, no network).
 * Checks the rules the SERVER must enforce even if someone skips the web page:
 * closed registration, seat cap, duplicates, honeypot, lucky-draw one-entry-per-email.
 */
process.env.MOCK_AI = '1'
delete process.env.SHEETS_WEBHOOK_URL
delete process.env.OPEN_REGISTRATION
process.env.MAX_SEATS = '2' // tiny cap so we can fill the event in a test
process.env.NODE_ENV = 'test'

const { default: register } = await import('../api/register.js')
const { default: score } = await import('../api/score.js')
const { default: stats } = await import('../api/stats.js')
const { resetDevStore } = await import('../api/_lib/sheets.js')
const { REGISTRATION_CLOSES } = await import('../shared/event.js')

let ipCounter = 0
async function call(handler, { method = 'POST', body } = {}) {
  const req = { method, body, headers: { 'x-forwarded-for': `10.0.0.${++ipCounter}` }, socket: {} }
  const out = { status: 200, body: undefined }
  const res = {
    status(code) { out.status = code; return res },
    json(data) { out.body = data; return res },
    setHeader() {},
  }
  const log = console.log, warn = console.warn
  console.log = console.warn = () => {} // hide the dev-store chatter
  try { await handler(req, res) } finally { console.log = log; console.warn = warn }
  return out
}

const person = (n, extra = {}) => ({
  name: 'Test Student', email: `student${n}@example.com`, college: 'Test College', year: '3rd year', ...extra,
})
const project = (email) => ({
  name: 'Test Student', email, title: 'CropDoctor',
  description: 'A web app where farmers upload a leaf photo and an AI model names the disease and suggests treatment.',
})

let pass = 0, fail = 0
const check = (name, ok, detail = '') => {
  if (ok) pass++
  else fail++
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${ok ? '' : '   ' + detail}`)
}

// ---------- closed registration ----------
const realNow = Date.now
resetDevStore()
Date.now = () => Date.parse(REGISTRATION_CLOSES) + 60_000
let r = await call(register, { body: person(1) })
check('After the deadline, the API rejects registration (403 closed)', r.status === 403 && r.body.code === 'closed', JSON.stringify(r))
r = await call(stats, { method: 'GET' })
check('/api/stats reports closed=true after the deadline', r.body.closed === true, JSON.stringify(r))

process.env.OPEN_REGISTRATION = '1'
r = await call(register, { body: person(1) })
check('OPEN_REGISTRATION=1 overrides the deadline (for demos)', r.status === 200, JSON.stringify(r))
delete process.env.OPEN_REGISTRATION
Date.now = realNow

r = await call(stats, { method: 'GET' })
check('/api/stats reports closed=false before the deadline', r.body.closed === false, JSON.stringify(r))

// ---------- seat cap + duplicates ----------
resetDevStore()
r = await call(register, { body: person(1) })
check('First registration succeeds', r.status === 200 && r.body.duplicate === false, JSON.stringify(r))
r = await call(register, { body: person(1, { email: 'STUDENT1@example.com' }) })
check('Same email in different case is a duplicate, not a new seat', r.status === 200 && r.body.duplicate === true, JSON.stringify(r))
r = await call(register, { body: person(2) })
check('Second person takes the last seat (cap is 2)', r.status === 200 && r.body.duplicate === false, JSON.stringify(r))
r = await call(register, { body: person(3) })
check('Third person is refused when the event is full (409 full)', r.status === 409 && r.body.code === 'full', JSON.stringify(r))
r = await call(register, { body: person(1) })
check('Someone already registered still gets a friendly answer when full', r.status === 200 && r.body.duplicate === true, JSON.stringify(r))

// ---------- validation, honeypot, method ----------
r = await call(register, { body: person(9, { email: 'nope' }) })
check('Bad email is rejected (400)', r.status === 400 && r.body.errors?.email, JSON.stringify(r))
resetDevStore()
r = await call(register, { body: person(5, { company_website: 'spam.example' }) })
check('Honeypot gets a fake success', r.status === 200 && r.body.ok === true, JSON.stringify(r))
r = await call(register, { body: person(5) })
check('...and nothing was saved (real signup is not a duplicate)', r.body.duplicate === false, JSON.stringify(r))
r = await call(register, { method: 'GET' })
check('GET on /api/register is 405', r.status === 405, JSON.stringify(r))

// ---------- lucky draw: one entry per email ----------
resetDevStore()
r = await call(score, { body: project('draw@example.com') })
check('First calculator submission enters the lucky draw', r.status === 200 && r.body.luckyDraw?.entered === true && r.body.luckyDraw?.repeat === false, JSON.stringify(r.body?.luckyDraw))
r = await call(score, { body: project('DRAW@example.com') })
check('Second submission (same email) is saved but marked as a repeat', r.status === 200 && r.body.luckyDraw?.entered === true && r.body.luckyDraw?.repeat === true, JSON.stringify(r.body?.luckyDraw))
r = await call(score, { body: project('other@example.com') })
check('A different email gets its own entry', r.body.luckyDraw?.repeat === false, JSON.stringify(r.body?.luckyDraw))
r = await call(score, { body: { name: 'A', email: 'a@b.co', title: 'T' } })
check('Submission with no link and no description is rejected (400)', r.status === 400, JSON.stringify(r))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
