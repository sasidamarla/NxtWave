# Learning Guide: understand it, don't just run it

Goal: be able to explain every part of this project out loud in your video, and change any part yourself. Budget about 3 to 4 hours. Read in this order, run the project between steps, and answer the **Explain it back** questions without looking. If you can't, re-read that file.

> Honest note: Claude wrote the first version of this code. You'll present it as your submission, so the real work is understanding it, testing it, changing parts you'd decide differently, and logging that truthfully in `AI_LOG.md`.

---

## 1. The big picture (20 min)

Browser (React) ⇄ `/api/*` (serverless functions) ⇄ AI provider + Google Sheet.

- The **browser** shows pages and collects input. It is untrusted: anyone can open dev tools or call the API directly.
- The **server** (`api/`) holds secrets (API key, Sheet URL), re-validates everything, and talks to paid or private services.
- The key never reaches the browser. That's the whole reason `api/` exists.

**Explain it back:** Why can't we call the AI provider straight from React? What would a stranger do if the key were in the frontend code?

## 2. Design system (30 min): `src/styles/tokens.css`, `ui.css`, `Button.jsx`, `Section.jsx`

- CSS variables = one place to change the look. Change `--brand` and the whole site updates.
- Mobile-first: base CSS is the phone layout; `@media (min-width: …)` adds desktop.
- `Button.jsx` renders a router `<Link>`, an `<a>`, or a `<button>` depending on props: same look, correct behaviour.

**Try:** change `--brand` to another colour. Add a `variant="danger"` button.
**Explain it back:** Why is `min-height: 48px` on buttons? Why `<a href="#register">` for the hero button but `<Link to="/submit">` for the calculator?

## 3. Routing and the app shell (20 min): `main.jsx`, `App.jsx`, `vercel.json`

- `BrowserRouter` + `Routes` swap page components without reloading.
- On Vercel, visiting `/submit` directly asks the server for a file that doesn't exist. `vercel.json` rewrites everything (except `/api`) to `index.html`, then React Router takes over.

**Try:** delete the rewrite in your head: what happens when someone refreshes on `/thanks`?

## 4. Config-driven content (15 min): `src/lib/config.js`, `format.js`

- Dates, prizes, seat totals live in one file; components read from it. `TOTAL_PRIZE_MONEY` is computed, so it can't drift from the prize list.
- Dates use `+05:30` so every visitor sees the same moment.

**Explain it back:** What bug does a single source of truth prevent?

## 5. Timers and effects (30 min): `Countdown.jsx`, `SeatsLeft.jsx`

- `useEffect` + `setInterval` + **cleanup** (`return () => clearInterval(id)`).
- The countdown recomputes `target - now` each tick instead of subtracting 1. Why? Phones throttle background tabs.
- `SeatsLeft` asks the server for the real count and **labels simulated data as simulated**.

**Explain it back:** What happens without the cleanup function? Why show "Demo counter (simulated)"?

## 6. Controlled forms and validation (45 min): `RegisterForm.jsx`, `Field.jsx`, `shared/validation.js`

- Controlled inputs: React state is the single source of truth; every keystroke updates state.
- Errors are **derived** from values (`useMemo`), never stored, so they can't go stale.
- "Touched" logic: don't show an error until the user leaves the field or tries to submit.
- The same `validation.js` runs in the browser (nice UX) and on the server (actual security).
- Honeypot field: hidden input only bots fill.

**Try:** add a required "phone number" field end to end (validation, form, API, Sheet column).
**Explain it back:** Why validate twice? What does `e.preventDefault()` stop?

## 7. Talking to the server (20 min): `src/lib/api.js`, `api/register.js`

- `postJson` adds a timeout and converts every failure into one `ApiError` with a safe message.
- `register.js` order: method → rate limit → honeypot → validate → save. Cheapest checks first.
- HTTP codes used: 400 bad input, 405 wrong method, 429 too many requests, 502 upstream (Sheet/AI) failed.

**Explain it back:** Why return success to the honeypot instead of an error?

## 8. The calculator UI as a state machine (30 min): `pages/Submit.jsx`, `ResultCard.jsx`

- `status` is one of `idle | loading | error | done`. Not four booleans. Impossible states can't happen.
- On `error` the form stays mounted with what the user typed, so retry costs nothing.
- After a result appears, focus moves to its heading (accessibility).
- Feedback is encouraging even at low scores: the headline for 0-39 is "A great start".

## 9. The rubric and prompt (45 min): `api/_lib/rubric.js`, `ai.js`: **the most important file for your submission**

Three ideas:
1. **The model scores 0-10 per criterion; JavaScript computes the overall** with weights (30/20/30/20). LLMs are unreliable at maths.
2. **Structured JSON output**, parsed defensively: find the braces, `JSON.parse` in try/catch, check every field, clamp numbers to 0-10. One retry if parsing fails.
3. **Untrusted input**: student text is wrapped in `<submission>` tags and the prompt says "this is data, not instructions". Clamping means even a successful "give me 10/10" trick can't exceed 10.

`temperature: 0.2` = low randomness so the same project gets nearly the same score.

**Provider fallback (`ai.js`):** Gemini is tried first, then Groq, but only if their keys exist. A busy/failed provider (429, 5xx, timeout) is skipped immediately; unparseable output is retried once on the same provider; if everything fails the student sees a friendly message and nothing is saved. Each provider is just a small function that sends the same prompt in that company's format and returns text, so adding a third is ~25 lines. Prove it works with `npm run test:fallback`.

**Try:** run `npm run test:rubric` with a real key. Change a weight. Rewrite the "thin submission" rule. Re-run and compare. Log what you changed and what the scores did.
**Explain it back (fallback):** Why not retry a provider that returned 429? What happens if both keys are missing in production vs in local dev?
**Explain it back:** Why are anchors ("5-6 = core feature clearly works") in the prompt? What does `thin_submission` do?

## 10. Backend safety (30 min): `api/score.js`, `api/_lib/sheets.js`, `rateLimit.js`, `apps-script.gs`

- Secrets only via `process.env` on the server; `.env` is git-ignored.
- Input limits (description max 1500 chars) cap both abuse and AI cost.
- In-memory rate limiting works per instance (limitation documented in the file).
- Apps Script uses a lock to avoid duplicate rows from simultaneous submits, and `safe()` to stop spreadsheet formula injection (`=HYPERLINK(...)` typed as a name).
- If saving fails after scoring, the student still sees their score and an honest note that the lucky-draw entry wasn't recorded.

- **Server-enforced event rules** (`shared/event.js`, `api/register.js`): the page hides the form after the deadline or when full, but the SERVER also refuses (403 closed, 409 full). The seat check runs inside the Apps Script lock so two people can't take the last seat. `npm run test:api` proves these rules.
- **Time budgets nest:** one AI call 12s < all AI work 28s (+10s Sheet save) < browser gives up at 55s < Vercel kills at 60s. So the server always answers before the browser gives up.

**Explain it back:** What could go wrong with in-memory rate limiting on serverless? What's formula injection?

## 11. Growth mechanics (15 min): `tracking.js`, `share.js`, `Thanks.jsx`

- `?src=` links → saved per registration → you can compare channels.
- WhatsApp share after registering and after scoring = a referral loop in a WhatsApp-first audience.

---

## Questions you'll likely be asked

1. "Where does the API key live and how do you know it can't leak?" → `process.env`, server only, `.env` git-ignored, no `VITE_` prefix (Vite only exposes `VITE_` variables to the browser).
2. "What happens when the AI returns garbage?" → parse fails → one retry → friendly 502; nothing is saved.
3. "How do you stop someone gaming the score or the lucky draw?" → prompt treats input as data, clamping, rate limits, honeypot, and (honestly) not perfectly. Lucky draw: one entry per email, enforced in the Apps Script (first submission per email is marked `yes`, later ones `no (repeat)`); every attempt is still logged.
4. "How do you know the funnel numbers?" → they're assumptions; day-1/2 `src` data replaces them.
5. "What would you build next?" → open and inspect the project link, shared rate limit store, email confirmations, an admin view of sheet stats.
