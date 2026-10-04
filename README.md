# Build Your First AI Project in 60 Minutes: Landing Page + Project Score Calculator

A React + Vite site with two linked parts, built for the NxtWave Growth Challenge simulation:

- **Landing page** (`/`): hero, outcomes, prizes, countdown, seats left, registration form.
- **Project Score Calculator** (`/submit`): a student describes a project, an AI scores it on four criteria and returns strengths-first feedback. Every submission enters the ₹200 lucky draw.
- `/thanks`: confirmation page with a WhatsApp share button.

## Run it locally

Needs Node 20.19+ (check with `node -v`).

```bash
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm run dev               # opens http://localhost:5173
```

`npm run dev` runs the frontend **and** the `/api` endpoints (a small plugin in `vite.config.js` does this), so you don't need the Vercel CLI.

With the default `.env` (`MOCK_AI=1`, no Sheet), everything works locally: scoring uses a simple rule-based stand-in, and registrations/duplicates live in memory. To use the real AI, set `GEMINI_API_KEY` (free key from Google AI Studio) and `MOCK_AI=0`. Optionally add `GROQ_API_KEY` as a fallback: if Gemini is busy or failing, the server automatically retries the same prompt on Groq. Students never enter a key; the keys live only on your server.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (frontend + API) |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | Static checks |
| `npm run test:rubric` | Scores 4 sample projects (strong, average, weak, nonsense) and checks the ranges |
| `npm run test:api` | Checks the rules the server enforces: deadline, seat cap, duplicates, honeypot, one lucky-draw entry per email (no keys needed) |
| `npm run test:fallback` | Simulates Gemini/Groq failures with a fake `fetch` to prove the fallback logic (no keys needed) |

## Folder map

```
api/                 Serverless functions (Vercel turns each file into an endpoint)
  register.js        POST /api/register  -> validate -> save to Sheet
  score.js           POST /api/score     -> validate -> AI score -> save -> return
  stats.js           GET  /api/stats     -> real registration count (or "simulated")
  _lib/              Helpers (underscore = not an endpoint): rubric+prompt, AI call, Sheet, rate limit
shared/validation.js Validation used by BOTH browser and server
src/
  components/        Button, Card, Section, Navbar, Footer, Field, Countdown, SeatsLeft,
                     RegisterForm, ScoreForm, ScoreBar, ResultCard
  pages/             Landing, Submit, Thanks, NotFound
  styles/            tokens.css (design variables), base.css, ui.css, landing.css, calculator.css
  lib/               config.js (dates/prizes/seats), api.js, tracking.js, share.js, format.js
docs/                apps-script.gs, LEARNING_GUIDE.md, SUBMISSION_OUTLINE.md
AI_LOG.md            Log of AI prompts, suggestions and what you changed or rejected
```

## Set up storage (Google Sheet)

1. Create a Google Sheet. **Extensions → Apps Script**, paste `docs/apps-script.gs`.
2. Change `SECRET` to a long random string.
3. **Deploy → New deployment → Web app**, Execute as **Me**, access **Anyone**. Copy the URL.
4. Put the URL in `SHEETS_WEBHOOK_URL` and the secret in `SHEETS_SECRET` (in `.env` locally, in Vercel env vars when deployed).
5. Test: register once locally. A `Registrations` tab with your row should appear. Register again with the same email: no second row.

**Rules the server enforces** (not just the page): registration closes at `REGISTRATION_CLOSES` and stops at `TOTAL_SEATS`, both in `shared/event.js`. Set `OPEN_REGISTRATION=1` to keep demoing after the deadline. The lucky draw is **one entry per email**: every scored attempt is logged in `Submissions`, but only the first per email is marked `luckyDrawEntry = yes`. Draw from rows where that column is `yes`.

**If you already created the Sheet with an older script:** paste the new `apps-script.gs`, deploy a **New version**, delete the old test rows, and add a header `luckyDrawEntry` in column M of `Submissions` (or delete that tab and let the script recreate it).

**Joining links are not sent automatically.** The form tells students the organizers will email the link before the workshop. You must do that (for example copy the emails from the `Registrations` tab into a BCC mail merge). Automating it with Apps Script's `MailApp` is possible, but check Google's daily email quota first.

Source tracking: share links as `https://your-site/?src=wa-ece-3rdyr`. The `src` value is saved with each registration, so you can see which channel worked.

## Deploy (GitHub + Vercel)

1. `git add . && git commit -m "Initial commit"`. Create an empty GitHub repo, then `git remote add origin <url>` and `git push -u origin main`.
2. On vercel.com: **Add New → Project**, import the repo. Framework preset: Vite (auto-detected).
3. **Settings → Environment Variables**: add `GEMINI_API_KEY`, `GROQ_API_KEY` (optional fallback), `GEMINI_MODEL`/`GROQ_MODEL` (optional), `SHEETS_WEBHOOK_URL`, `SHEETS_SECRET`. Do **not** add `MOCK_AI`.
4. Redeploy so the variables take effect.
5. Test on the live link (checklist below).

`.env` is in `.gitignore`. Never commit it. If a key ever leaks, revoke it and create a new one.

## Pre-submission test checklist

- [ ] Register with valid details → lands on `/thanks`, row appears in the Sheet
- [ ] Register again with the same email → friendly "already registered", no duplicate row
- [ ] Bad email (`abc`) and empty fields → inline errors, no network call
- [ ] Calculator: no link and no description → blocked; bad URL → blocked
- [ ] Calculator with a real description → score, strengths, next steps, lucky-draw confirmation, row in `Submissions`
- [ ] Turn off Wi-Fi mid-submit → clear error and a working retry
- [ ] Open on a real phone (not just a narrow browser window); tap every button; WhatsApp share works
- [ ] Paste the live link in WhatsApp → preview shows the share image and title
- [ ] `npm run test:rubric` with the real key → all 4 samples in range
- [ ] Update `REGISTRATION_CLOSES` in `shared/event.js` and `workshopStart` in `src/lib/config.js` to your real schedule
- [ ] `npm run test:api`, `npm run test:fallback` and `npm run test:rubric` (with a real key; the mock run is inconclusive)

## Known limits (be upfront about these)

- The AI reads the **text** a student submits. It does not open the project link, so scores reflect the description. The form says so.
- Dates: `REGISTRATION_CLOSES` and `workshopStart` are placeholders. After the deadline the server refuses new registrations, so update them (or set `OPEN_REGISTRATION=1`) if reviewers will open the site later.
- Rate limiting is in-memory per server instance: it stops casual spam, not a determined attacker. A production version would use a shared store such as Upstash Redis.
- The seat counter shows the **real** Sheet count when connected; otherwise a labelled simulated number.
- Free AI tiers have shared limits and may log what you send. We only send the project title, link and description (never name or email), and the form says so. The Groq fallback reduces, but does not remove, the chance of hitting limits on a busy day.
- AI scores are a learning aid, not an official judgement. Final prizes should be decided by humans.

## Troubleshooting

- **`/api/...` returns 404 locally**: use `npm run dev`, not `npm run preview`.
- **Registration says "couldn't save"**: check `SHEETS_WEBHOOK_URL`/`SHEETS_SECRET`; redeploy the Apps Script after editing (New version).
- **Scoring says "AI mentor had a hiccup"**: check the server logs (Vercel → Logs) for the provider error; usually a wrong key or no credit.
- **429 "too many attempts"** while testing: wait 10 minutes or restart the dev server.
