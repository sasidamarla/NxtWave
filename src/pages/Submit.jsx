import { useState } from 'react'
import Card from '../components/Card.jsx'
import ScoreForm from '../components/ScoreForm.jsx'
import ResultCard from '../components/ResultCard.jsx'
import Button from '../components/Button.jsx'
import { postJson } from '../lib/api.js'
import { getSource } from '../lib/tracking.js'
import { LUCKY_DRAW } from '../lib/config.js'
import { rupees } from '../lib/format.js'

/**
 * This page is a tiny STATE MACHINE. Exactly one of these is true at a time:
 *   idle    -> show the form
 *   loading -> form is disabled, spinner on the button
 *   error   -> form is back, with an error message and a retry (the form keeps what you typed)
 *   done    -> show the result card
 * Modelling UI as named states (not a pile of booleans) prevents impossible
 * combinations like "loading AND showing a result".
 */
export default function Submit() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [last, setLast] = useState({}) // remembers what was typed, for retry / "score another"

  async function handleSubmit(clean, honeypot) {
    setLast(clean)
    setStatus('loading')
    setError('')
    try {
      const res = await postJson(
        '/api/score',
        { ...clean, company_website: honeypot, source: getSource() },
        { timeoutMs: 55000 }, // must be longer than the server's AI time budget (api/_lib/ai.js)
      )
      setData(res)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function handleReset() {
    setData(null)
    setError('')
    setLast((l) => ({ name: l.name, email: l.email })) // keep identity, clear the project
    setStatus('idle')
  }

  return (
    <div className="container calc">
      <header className="calc__head">
        <span className="section__kicker">Instant AI feedback</span>
        <h1>Project Score Calculator</h1>
        <p className="section__intro">
          Built an AI project, or building one at the workshop? Get a score and friendly feedback in seconds.
          Every submission enters the {rupees(LUCKY_DRAW.amount)} lucky draw.
        </p>
      </header>

      {status === 'done' && data?.result ? (
        <ResultCard data={data} title={last.title} email={last.email} onReset={handleReset} />
      ) : (
        <Card>
          <ScoreForm
            initialValues={last}
            loading={status === 'loading'}
            serverError={status === 'error' ? error : ''}
            onSubmit={handleSubmit}
          />
        </Card>
      )}

      {status !== 'done' && (
        <p className="calc__foot">
          Haven't registered for the workshop yet? <Button to="/#register" variant="ghost" size="sm">Reserve your free seat</Button>
        </p>
      )}
    </div>
  )
}
