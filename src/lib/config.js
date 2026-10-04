import { REGISTRATION_CLOSES, TOTAL_SEATS } from '../../shared/event.js'

/**
 * ONE PLACE FOR EVENT FACTS
 * Change dates, seats and prizes here; every component reads from this file.
 * That avoids "I updated the hero but forgot the footer" bugs.
 */

export const EVENT = {
  title: 'Build Your First AI Project in 60 Minutes',
  shortTitle: 'AI in 60',
  durationMinutes: 60,
  // ISO strings with an explicit +05:30 (IST) offset so every visitor sees the same moment.
  workshopStart: '2026-10-12T19:00:00+05:30',
  // These two come from shared/event.js because the SERVER enforces them too.
  registrationCloses: REGISTRATION_CLOSES,
  campaignStart: '2026-10-05T09:00:00+05:30',
  totalSeats: TOTAL_SEATS,
  audience: '3rd & 4th year B.Tech students',
}

export const PRIZES = [
  { rank: '1st', amount: 1000, label: 'Best project' },
  { rank: '2nd', amount: 500, label: 'Runner-up' },
  { rank: '3rd', amount: 300, label: 'Third place' },
]

export const LUCKY_DRAW = {
  amount: 200,
  rule: 'Open only to students who submit a project through the Score Calculator.',
}

// Sanity check: the whole budget is prize money. (1000 + 500 + 300 + 200 = 2000)
export const TOTAL_PRIZE_MONEY =
  PRIZES.reduce((sum, p) => sum + p.amount, 0) + LUCKY_DRAW.amount

export const OUTCOMES = [
  {
    icon: '🛠️',
    title: 'Ship a working AI project',
    text: 'Go from blank folder to something that runs and does something useful, in one hour.',
  },
  {
    icon: '🧠',
    title: 'Understand it, not just copy it',
    text: 'Learn why each piece exists, so you can change it and build the next one yourself.',
  },
  {
    icon: '⚡',
    title: 'Get instant AI feedback',
    text: 'Score your project in seconds and see exactly what to improve next.',
  },
  {
    icon: '🔗',
    title: 'Leave with a link to show',
    text: 'A live project you can put on your resume, LinkedIn and in interviews.',
  },
]

export const RUBRIC_PUBLIC = [
  { key: 'functionality', label: 'Functionality', blurb: 'Does it work and do what it claims?' },
  { key: 'creativity', label: 'Creativity', blurb: 'Is the idea fresh or personal?' },
  { key: 'aiUse', label: 'Use of AI', blurb: 'Is AI doing real, meaningful work?' },
  { key: 'completion', label: 'Completion', blurb: 'Is it finished and shareable?' },
]
