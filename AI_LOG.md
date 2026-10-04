# AI Log

Keep this honest and specific. This project was built with AI assistance, but I reviewed, tested, and changed the generated implementation rather than treating the AI output as automatically correct.

## How I used AI on this project

- Tool: Claude (chat + file/shell tools).
- Division of work: The AI generated the first full version of the code and documentation. I am responsible for understanding it, testing it, and changing decisions when the generated implementation was incorrect or not suitable.
- I asked for the whole build instead of step by step, and asked for a learning guide (`docs/LEARNING_GUIDE.md`) so I could understand the implementation afterwards.
- I used testing and manual verification to check important parts of the generated implementation instead of assuming that generated code or configuration was correct.

---

## Phase 0: Setup

- **Prompt:** Full challenge brief + "build the whole thing, I'll learn it".
- **AI suggestion:** Vite + React in JavaScript (not TypeScript) for the 48-hour limit; `react-router-dom`; folders `components/`, `pages/`, `styles/`, `lib/`, `api/`, `shared/`; `.env` in `.gitignore`.
- **My change / rejection:** I kept the proposed stack because it fit the 48-hour constraint and the challenge did not require TypeScript or a more complex framework. I also kept `.env` out of Git because API keys should not be committed to the repository. I focused my changes on verifying the generated implementation and fixing issues found during testing rather than changing the stack unnecessarily.

---

## Phase 1: Design system

- **AI suggestion:** "Warm paper + hard ink" look; Space Grotesk + Inter; all colours as CSS variables; Button / Card / Section / Navbar components.
- **My change / rejection:** I kept the overall design system because it gives the campaign a distinctive visual identity without requiring a large UI library. I reviewed the component structure and kept reusable components instead of putting all styling and markup into individual pages.

---

## Phase 2: Landing page

- **AI suggestion:** Hero, Outcomes, Prizes, Urgency (countdown + seats), Register, Footer. Seat counter reads the real Sheet count, or shows a clearly labelled simulated number. Registration deadline and workshop date are placeholders in `config.js` / `shared/event.js`.
- **My change / rejection:** I kept the overall landing-page structure because it directly supports the campaign funnel. I made sure simulated seat information is clearly labelled rather than presenting a fake number as real registration data. I also kept the event configuration centralized so the deadline and event information can be changed without rewriting the page.

---

## Phase 3: Registration

- **AI suggestion:** Controlled form, shared client/server validation, honeypot, friendly duplicate handling, `?src=` channel tracking, Google Sheet via Apps Script.
- **My change / rejection:** I kept this approach because it provides validation and basic abuse protection without adding a database or authentication system that was unnecessary for the challenge. I also kept `?src=` tracking because it allows registrations to be associated with acquisition channels such as WhatsApp groups. I manually tested duplicate registration handling and the server-side registration rules.

---

## Phase 4-5: Calculator and rubric

- **AI suggestion:** 4 criteria weighted 30/20/30/20; AI gives 0-10 each, code computes the total; strengths-first JSON; temperature 0.2; thin submissions handled kindly; AI reads text only (does not open links).
- **Test results (`npm run test:rubric`, real AI, final run):**
  - strong: 75
  - average: 51
  - weak: 8
  - nonsense: 0
  - All four samples were inside their expected ranges.

- **Prompt edit I made and what happened:** On the earlier real run, the WEAK sample scored **0** and failed its expected range. The prompt treated a vague-but-real idea too much like gibberish. I changed rule 5 so gibberish still scores 0, but a vague real idea can receive 1 for functionality, creativity, and use of AI, with 0 for completion. After rerunning the test, WEAK went from 0 to 8 and all four samples passed.

- **Something I noticed:** The nonsense input still produced summary wording that was more encouraging than the actual submission justified, such as wording suggesting that the user had started a project structure. The score itself was correct at 0, but the feedback wording could be more precise for completely invalid submissions.

- **My change / rejection:** I kept text-only scoring rather than automatically opening submitted project links. This makes the system safer and more predictable for a 48-hour challenge because arbitrary links can introduce security, reliability, scraping, and latency concerns. For a production version, I would consider controlled project inspection separately rather than allowing the AI to freely browse submitted URLs.

---

## Phase 6-8: Backend, deploy

- **AI suggestion:** Vercel serverless functions; keys in environment variables; in-memory rate limit with the limitation documented. Initially an Anthropic model was suggested. I chose to switch to Gemini because I wanted a free tier, then asked for a Groq fallback for free-tier limits. The AI built both providers, plus a fake-`fetch` test for the fallback (`npm run test:fallback`, 7 scenarios).

- **Things the AI could not verify, and what I found when I ran it:**
  - The initial model names generated by the AI were not reliable. I tested the configuration instead of assuming the generated model names were current.
  - Gemini returned 503 "high demand" responses during testing. The fallback to Groq handled the failure and the calculator continued working, which is the main reason I added the fallback.
  - I updated the Gemini configuration to use `gemini-3.8-flash`.
  - I updated the Groq fallback to use `openai/gpt-oss-20b`.
  - The updated Groq model is also used as the code fallback when `GROQ_MODEL` is not supplied as an environment variable.
  - The actual API keys remain in environment variables and are not committed to GitHub.
  - I did not commit my `.env` file because it contains secrets. The repository contains the example environment configuration instead.

- **Free-tier limits and whether prompts are logged:** These are provider-dependent and can change over time, so I treated provider documentation as the source of truth rather than relying on AI-generated assumptions. I also designed the application so that personal registration information such as name and email is not sent to the AI scoring provider; the AI receives the project information needed for scoring.

- **Sheets:** I set up the Google Sheet + Apps Script web app, confirmed that registration/submission rows were being written, and fixed a missing-row problem during testing. The issue was related to the integration not writing the expected row correctly, so I verified the Apps Script flow and retested it.

- **My change / rejection:** I did not treat the generated AI provider configuration as automatically correct. I tested the actual API calls, found model/API availability problems, checked the current provider information, and changed the model configuration. I also kept the fallback architecture because the real Gemini 503/high-demand responses showed why having a second provider was useful.

---

## Phase 9: Submission

- **AI suggestion:** 5-slide structure and funnel math (see `docs/SUBMISSION_OUTLINE.md`) built on assumed conversion rates such as 35% landing-to-register and approximately 12% of a WhatsApp group tapping the link. These numbers are assumptions, not measured campaign results.
- **My change / rejection:** I kept the funnel calculations but made sure they are presented as assumptions rather than actual performance data. I would use the first few days of campaign data to replace the assumptions with measured conversion rates and make a channel decision based on the results.

---

## Review round: problems found after the first version

A review of the project identified several issues. I checked each one against the implementation and corrected the ones that were real:

1. The page promised an email that the code did not actually send. The wording was changed so that it says the organizers send the information rather than claiming the application sends it automatically.
2. The deadline and 500-seat cap were initially only shown in the UI. They are now enforced by the server and the Sheet script and are covered by `npm run test:api`, which passes 17 checks.
3. The learning guide claimed lucky-draw deduplication by email that did not initially exist. I implemented one lucky-draw entry per email and corrected the guide.
4. The rubric test originally printed "All samples in range" when the AI was mocked. It now reports the result as inconclusive unless a real AI evaluation was performed.
5. Browser, server, and AI timeouts did not initially align. They were adjusted so the AI call, API request, browser request, and Vercel execution have compatible timeout windows.

- **My own decisions / what I'd add:** I chose not to add a database, authentication, or a paid shared rate-limiting service because they were not necessary for the 48-hour challenge. For a production version, I would replace the in-memory rate limiter with a shared store, add stronger analytics, and improve monitoring of AI-provider failures.

---

## "AI suggested, I rejected"

One decision I disagreed with was the idea of automatically opening and inspecting the project link during AI scoring.

The AI's simpler approach was to score only the project title and description. I decided to keep that approach for this challenge because automatically visiting arbitrary submitted URLs introduces security, reliability, scraping, and latency concerns. For a production version, I would consider controlled project inspection in a sandboxed environment, but for a 48-hour challenge the text-only approach was the safer and more predictable trade-off.

---

## Reflection

### What did the AI get right that I'd have missed?

AI helped me structure the project quickly, especially the shared validation, server-side enforcement, channel tracking, AI scoring structure, fallback provider, and automated testing. It also helped turn the growth idea into an actual product flow rather than only a static landing page.

### What did I have to correct or test that the AI didn't catch?

I had to verify the generated implementation instead of assuming it was correct. The initial AI-generated model names were stale, and I found this by actually running the API calls. Gemini also returned 503/high-demand responses, which demonstrated why the fallback was useful. The WEAK rubric sample initially scored 0, so I changed the prompt and reran the test until the weak sample was correctly separated from nonsense. A review also found that the landing page promised an email that the implementation did not actually send, so I corrected the wording.

### What would I do differently with another 48 hours?

I would add a shared production-grade rate limiter, improve funnel analytics, test the AI rubric with a larger and more diverse set of real project submissions, and improve the handling of extremely weak or nonsensical submissions so that the feedback is as accurate as the score.
