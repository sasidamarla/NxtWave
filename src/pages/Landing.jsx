import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Section from '../components/Section.jsx'
import Countdown from '../components/Countdown.jsx'
import SeatsLeft from '../components/SeatsLeft.jsx'
import RegisterForm from '../components/RegisterForm.jsx'
import { EVENT, LUCKY_DRAW, OUTCOMES, PRIZES, TOTAL_PRIZE_MONEY } from '../lib/config.js'
import { formatDate, formatTime, rupees } from '../lib/format.js'

export default function Landing() {
  // Support links like /#register coming from other pages (the Navbar button).
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView()
  }, [hash])

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="section__kicker">Free live workshop</span>
            <h1>
              Build your first <span className="hero__hl">AI project</span> in 60 minutes
            </h1>
            <p className="hero__sub">
              No AI experience needed. Leave with a project that works, a link to show recruiters,
              and a shot at {rupees(TOTAL_PRIZE_MONEY)} in prizes.
            </p>
            <div className="hero__cta">
              <Button href="#register">Reserve my free seat</Button>
              <Button to="/submit" variant="secondary">Score my project</Button>
            </div>
            <ul className="hero__meta" aria-label="Event details">
              <li className="chip">📅 {formatDate(EVENT.workshopStart)}</li>
              <li className="chip">🕖 {formatTime(EVENT.workshopStart)}</li>
              <li className="chip">⏱️ {EVENT.durationMinutes} min</li>
              <li className="chip">🎓 {EVENT.audience}</li>
            </ul>
          </div>

          {/* Static example: shows the instant-feedback promise. Clearly labelled as an example. */}
          <Card tone="brand" className="hero__preview" aria-label="Example of instant AI feedback">
            <p className="hero__preview-tag">Example feedback</p>
            <div className="hero__preview-score">
              <span>72</span><small>/100</small>
            </div>
            <p className="hero__preview-line"><strong>What's working:</strong> a real problem, clear audience, live link.</p>
            <p className="hero__preview-line"><strong>Try next:</strong> show exactly where the AI helps the user.</p>
          </Card>
        </div>
      </section>

      {/* ---------- OUTCOMES ---------- */}
      <Section
        id="outcomes"
        kicker="What you'll get"
        title="One hour. A real project."
        intro="Built for beginners. You'll understand every step, not just paste code."
      >
        <div className="grid grid--4">
          {OUTCOMES.map((o) => (
            <Card key={o.title}>
              <div className="outcome__icon" aria-hidden="true">{o.icon}</div>
              <h3>{o.title}</h3>
              <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{o.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ---------- PRIZES ---------- */}
      <Section
        id="prizes"
        tone="tint"
        kicker={`${rupees(TOTAL_PRIZE_MONEY)} in prizes`}
        title="Build it. Win it."
        intro="Top 3 projects are judged on functionality, creativity, use of AI and completion."
      >
        <div className="grid grid--3">
          {PRIZES.map((p) => (
            <Card key={p.rank} tone={p.rank === '1st' ? 'pop' : 'default'} className="prize">
              <span className="prize__rank">{p.rank}</span>
              <span className="prize__amount">{rupees(p.amount)}</span>
              <span className="prize__label">{p.label}</span>
            </Card>
          ))}
        </div>

        <Card className="lucky">
          <div>
            <h3>{rupees(LUCKY_DRAW.amount)} lucky draw ⚡</h3>
            <p style={{ margin: 0 }}>
              {LUCKY_DRAW.rule} Score your project in seconds and get <strong>instant AI feedback</strong>:
              what's working, plus what to try next. Already built something? Score it now.
            </p>
          </div>
          <Button to="/submit" variant="pop">Try the Score Calculator</Button>
        </Card>
      </Section>

      {/* ---------- URGENCY ---------- */}
      <Section id="urgency" kicker="Limited seats" title="Seats are filling up">
        <div className="grid grid--2">
          <Card>
            <h3>Registration closes in</h3>
            <Countdown target={EVENT.registrationCloses} />
            <p className="field__hint" style={{ marginTop: '0.75rem' }}>
              Workshop: {formatDate(EVENT.workshopStart)}, {formatTime(EVENT.workshopStart)}
            </p>
          </Card>
          <Card>
            <h3>Seats</h3>
            <SeatsLeft />
          </Card>
        </div>
      </Section>

      {/* ---------- REGISTER ---------- */}
      <Section id="register" tone="ink" kicker="Free" title="Reserve your seat" intro="Takes 20 seconds. The organizers will email the joining link before the workshop.">
        <div className="register__wrap">
          <Card>
            <RegisterForm />
          </Card>
        </div>
      </Section>
    </>
  )
}
