# Submission Outline: 5-slide growth plan, notes, video

> Every conversion rate below is an **assumption**, not data. Say so on the slide, show the sensitivity, and replace them with your own reasoning. A plan that admits its assumptions beats one that sounds certain.

## The goal and the constraint
- **Goal:** 500 registrations from 3rd/4th-year B.Tech students in 7 days.
- **Budget:** ₹2,000, all prize money (₹1,000 / ₹500 / ₹300 + ₹200 lucky draw). **Paid ads: ₹0.**
- **Implied cost per registration:** ₹2,000 ÷ 500 = **₹4** (it's a prize pool, not ad spend, so it only works if the channels are free and the prizes are the hook).
- **Pace needed:** ~72 registrations/day.

## Funnel math (editable assumptions)

Work backwards from 500.

| Channel | Share | Registrations | Landing→register | Visits needed |
|---|---|---|---|---|
| WhatsApp groups | 60% | 300 | 35% | 857 |
| College clubs | 30% | 150 | 35% | 429 |
| Share loop (referrals) | 10% | 50 | 35% | 143 |
| **Total** | | **500** | | **~1,430 visits** |

**WhatsApp:** assume 200 members/group, ~50% see the message (100), ~12% tap the link → **12 visits/group** → 857 ÷ 12 ≈ **71 groups**.
**Clubs:** assume a club-lead announcement reaches ~150 students, ~20% tap (endorsed by someone they know) → **30 visits/club** → 429 ÷ 30 ≈ **14 clubs**.
**Share loop:** each registrant has ~20% chance of sharing, bringing ~1.5 visits → 500 × 0.2 × 1.5 × 0.35 ≈ **52 registrations** (K ≈ 0.1). Conservative, not viral.

**Sensitivity (say this out loud):** if landing→register is 20% instead of 35%, visits needed jump to 2,500 (+75%) and groups needed to ~125. The #1 thing to protect is conversion: 4 short fields, mobile-first, no login. Measure it on day 1 using `?src=` data.

## The 5 slides

1. **Goal, audience, constraint.** 500 regs / 7 days / ₹2,000 prize-only. Who: 3rd/4th-year B.Tech students (placement-anxious, WhatsApp-native). One line on why the prize pool is the hook.
2. **Funnel and channel plan.** The table above plus the per-group/per-club math. Mark assumptions clearly.
3. **The offer and the loop.** Free 60-min workshop + prizes + the **Score Calculator** as a growth tool: instant feedback gives a reason to visit now (not just on workshop day), the ₹200 lucky draw gives a reason to submit, the share button gives a reason to forward. Show the flow: group message → landing → register → /thanks → "score a project" → share.
4. **7-day calendar and checkpoints.** Day 0 test links; Days 1-2 seed ~20 groups + ~5 clubs with different `?src=` tags; **Day 3 checkpoint** (target ≈ 200 regs, check conversion per `src`); Days 4-5 double down on the best channel, drop the worst; Days 6-7 deadline push (countdown, seats left, "last day" message). Add what you'd change if Day 3 is under 120.
5. **Risks and metrics.** Metrics: visits, landing→register %, regs by `src`, calculator submissions, share clicks. Risks: WhatsApp admins blocking promos (mitigate: ask clubs, give admins a one-line forwardable message), low conversion (fix form/copy), prizes seen as small (frame the real value: a deployed project + feedback), AI scoring seen as unfair (human judges decide final prizes).

## Operations the page can't do for you
- **Send the joining link** to registered emails before the workshop (the page promises this; nothing sends it automatically). Plan it in the 7-day calendar.
- **Run the lucky draw** from `Submissions` rows where `luckyDrawEntry = yes` (one per email); announce how the winner was picked.
- **Judge the top 3** with humans; the AI score is a learning aid.

## AI learning notes (for the submission)
Pull from `docs/LEARNING_GUIDE.md` and `AI_LOG.md`. Three or four real things you learned, e.g.: never trust the browser; LLMs shouldn't do arithmetic; prompt-injection and clamping; why the API key lives server-side.

## "AI suggested, I rejected"
Use the section in `AI_LOG.md`. One genuine example with your reasoning.

## Reflection
Three short paragraphs: what worked, what you'd test with more time, what you'd do differently.

## 3-minute video script (suggested split)
- 0:00-0:30: The goal, the constraint, the idea in one sentence.
- 0:30-1:30: Live demo on your phone: landing → register → calculator → result → share.
- 1:30-2:15: One technical thing you're proud of (e.g., server-side scoring with structured output + injection defence, or the Gemini → Groq fallback so free-tier limits don't break the calculator) and one honest limitation.
- 2:15-3:00: The growth plan in one breath: channels, math, Day-3 checkpoint, what you'd change.
