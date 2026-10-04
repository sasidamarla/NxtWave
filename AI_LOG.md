# AI Log

Keep this honest and specific. Reviewers want to see how you worked with AI, including where you disagreed with it. The entries below record what the AI produced; the **"My change / rejection"** lines are yours to fill in as you read and test. Leave a line blank rather than invent something.

## How I used AI on this project

- Tool: Claude (chat + file/shell tools).
- Division of work: the AI generated the first full version of the code and docs. I am responsible for understanding it, testing it, and changing what I would decide differently.

---

## Phase 0: Setup
- **Prompt:** Full challenge brief + "build the whole thing, I'll learn it".
- **AI suggestion:** Vite + React in JavaScript (not TypeScript) for the 48-hour limit; `react-router-dom`; folders `components/ pages/ styles/ lib/ api/ shared/`; `.env` in `.gitignore`.
- **My change / rejection:**

## Phase 1: Design system
- **AI suggestion:** "Warm paper + hard ink" look; Space Grotesk + Inter; all colours as CSS variables; Button / Card / Section / Navbar.
- **My change / rejection:**

## Phase 2: Landing page
- **AI suggestion:** Hero, Outcomes, Prizes, Urgency (countdown + seats), Register, Footer. Seat counter reads the real Sheet count, or shows a clearly labelled simulated number. Registration deadline and workshop date are placeholders in `config.js`.
- **My change / rejection:** (e.g., did you change the dates, copy, or the claim about what the workshop covers?)

## Phase 3: Registration
- **AI suggestion:** Controlled form, shared client/server validation, honeypot, friendly duplicate handling, `?src=` channel tracking, Google Sheet via Apps Script.
- **My change / rejection:** (e.g., Formspree instead? extra fields?)

## Phase 4-5: Calculator and rubric
- **AI suggestion:** 4 criteria weighted 30/20/30/20; AI gives 0-10 each, code computes the total; strengths-first JSON; temperature 0.2; thin submissions handled kindly; AI reads text only (does not open links).
- **Test results (fill in after `npm run test:rubric` with a real key):**
  - strong: ___ / average: ___ / weak: ___ / nonsense: ___
- **Prompt edits I made and what happened to the scores:**
- **My change / rejection:**

## Phase 6-8: Backend, deploy
- **AI suggestion:** Vercel serverless functions; keys in env vars; in-memory rate limit (documented limitation). Initially an Anthropic model; **I chose to switch to Gemini because I wanted a free tier**, then **asked for a Groq fallback** for free-tier limits. The AI built both and a fake-`fetch` test for the fallback.
- **Things the AI could not verify:** current Gemini/Groq model names and free limits (I checked these myself: ___).
- **My change / rejection:**

## Phase 9: Submission
- **AI suggestion:** 5-slide structure and funnel math (see `docs/SUBMISSION_OUTLINE.md`) built on **assumed** conversion rates.
- **My change / rejection:**

---

## Review round: problems found after I shipped the first version
A reviewer read the project and found issues. I checked each against the code. They were real:
1. The page promised an email the code never sends -> wording changed to say the organizers send it; I must actually send it.
2. Deadline and 500-seat cap were only shown in the UI -> now enforced by the server and the Sheet script (and tested).
3. My own learning guide claimed lucky-draw dedupe by email that did not exist -> now implemented (one entry per email) and the guide corrected.
4. The rubric test printed "All samples in range" for the fake scorer -> now says INCONCLUSIVE unless a real AI ran.
5. Browser, server and AI timeouts did not nest -> aligned (12s call / 28s AI / 55s browser / 60s Vercel).
- **My own decisions / what I'd add (fill in):**

## "AI suggested, I rejected" (needed for the submission)

Pick something you **genuinely** disagreed with after thinking it through. Don't pick one just to have an answer. Decisions in this build where reasonable people differ:

1. **Rubric weights (30/20/30/20).** The AI weighted functionality and use of AI higher than creativity and completion. Would you weight differently for beginners? Why?
2. **Not opening the project link.** The AI chose to score only submitted text (simpler, safer, cheaper) even though real judges would open the project. Would you accept that trade-off?
3. **Restricting the form to 3rd/4th years only** vs. allowing everyone and tagging the year.
4. **In-memory rate limiting** vs. paying for a shared store now.
5. **Fixed encouraging headlines** ("A great start" even at 5/100). Honest, or too soft?
6. **The AI's growth ideas** (WhatsApp share loop, `?src=` tracking): which would you drop, and why?

Write: what the AI suggested → what you decided → your reasoning, in 3-4 sentences.

## Reflection (draft after you've shipped)
- What did the AI get right that I'd have missed?
- What did I have to correct or test that the AI didn't catch?
- What would I do differently with another 48 hours?
