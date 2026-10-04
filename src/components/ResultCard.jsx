import { useEffect, useRef, useState } from 'react'
import Button from './Button.jsx'
import Card from './Card.jsx'
import ScoreBar from './ScoreBar.jsx'
import { RUBRIC_PUBLIC, LUCKY_DRAW } from '../lib/config.js'
import { rupees } from '../lib/format.js'
import { shareOrWhatsapp, siteOrigin } from '../lib/share.js'

/** Encouraging labels only. Even a low score gets a positive, forward-looking title. */
function headline(overall) {
  if (overall >= 80) return 'Outstanding work'
  if (overall >= 60) return 'Strong project'
  if (overall >= 40) return 'Solid foundation'
  return 'A great start'
}

export default function ResultCard({ data, title, email, onReset }) {
  const { result, luckyDraw } = data
  const headingRef = useRef(null)
  const [shareNote, setShareNote] = useState('')

  // Move keyboard/screen-reader focus to the result when it appears.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  async function handleShare() {
    const text = `I scored ${result.overall}/100 on my AI project "${title}". Get instant AI feedback on yours and enter a ${rupees(LUCKY_DRAW.amount)} lucky draw:`
    const how = await shareOrWhatsapp({ text, url: `${siteOrigin()}/submit?src=share` })
    if (how === 'whatsapp') setShareNote('Opened WhatsApp in a new tab.')
  }

  return (
    <div className="result" aria-live="polite">
      <Card className="result__top">
        <div className="result__score" aria-label={`Overall score ${result.overall} out of 100`}>
          <span className="result__num">{result.overall}</span>
          <span className="result__of">/100</span>
        </div>
        <div>
          <h2 tabIndex={-1} ref={headingRef} className="result__headline">{headline(result.overall)}</h2>
          <p className="result__summary">{result.summary}</p>
        </div>
      </Card>

      {result.mock && (
        <div className="alert alert--info" style={{ marginTop: '1rem' }}>
          Demo scoring: no AI key is connected yet, so this score comes from a simple rule-based stand-in.
        </div>
      )}

      {result.thin && (
        <div className="alert alert--info" style={{ marginTop: '1rem' }}>
          We didn't have much to go on, so treat this score as a starting point. Add more detail and score again for a fuller picture.
        </div>
      )}

      <div className="result__grid">
        <Card>
          <h3>What's working</h3>
          <ul className="result__list result__list--good">
            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Card>
        <Card tone="pop">
          <h3>Try next</h3>
          <ul className="result__list">
            {result.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="result__bars">
        <h3>Score breakdown</h3>
        {RUBRIC_PUBLIC.map((c) => (
          <ScoreBar key={c.key} label={c.label} blurb={c.blurb} value={result.scores[c.key]} />
        ))}
      </Card>

      {luckyDraw?.entered && luckyDraw.repeat ? (
        <div className="alert alert--info" style={{ marginTop: '1.25rem' }}>
          This score is saved. The {rupees(LUCKY_DRAW.amount)} lucky draw allows one entry per email, and you're already in.
        </div>
      ) : luckyDraw?.entered ? (
        <div className="alert alert--success" style={{ marginTop: '1.25rem' }}>
          You're in the {rupees(LUCKY_DRAW.amount)} lucky draw (one entry per email). If you win, we'll email {email}.
        </div>
      ) : (
        <div className="alert alert--error" style={{ marginTop: '1.25rem' }}>
          We scored your project, but couldn't record your lucky-draw entry this time. Please submit again to be included.
        </div>
      )}

      <div className="result__actions">
        <Button onClick={handleShare}>Share my score</Button>
        <Button variant="secondary" onClick={onReset}>Score another project</Button>
        <Button variant="ghost" to="/#register">Reserve my workshop seat</Button>
      </div>
      {shareNote && <p className="field__hint" role="status">{shareNote}</p>}
    </div>
  )
}
