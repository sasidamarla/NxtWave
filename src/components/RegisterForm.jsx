import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import Field from './Field.jsx'
import { postJson } from '../lib/api.js'
import { EVENT } from '../lib/config.js'
import { getSource } from '../lib/tracking.js'
import { useStats } from '../lib/useStats.js'
import { YEARS, validateRegistration } from '../../shared/validation.js'

const EMPTY = { name: '', email: '', college: '', year: '', company_website: '' }
const FIELDS = ['name', 'email', 'college', 'year']

/**
 * CONTROLLED FORM, the core React idea:
 * `values` (state) is the single source of truth. Every keystroke calls
 * handleChange -> setValues -> React re-renders the inputs from state.
 * Errors are DERIVED from values (useMemo), never stored separately, so they can't go stale.
 * We only SHOW an error after the field was touched (blurred) or submit was tried,
 * so people aren't yelled at while still typing.
 *
 * The form also hides itself when registration is closed or the event is full.
 * The server enforces both rules too (api/register.js), because the UI alone can be bypassed.
 */
export default function RegisterForm() {
  const navigate = useNavigate()
  const stats = useStats()
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [serverError, setServerError] = useState('')
  const [blocked, setBlocked] = useState(null) // null | 'closed' | 'full' (learned from the server)

  const { errors } = useMemo(() => validateRegistration(values), [values])
  const showError = (name) => (touched[name] ? errors[name] : undefined)

  const isClosed = blocked === 'closed' || stats?.closed === true
  const isFull =
    blocked === 'full' || (stats && stats.simulated === false && stats.count >= EVENT.totalSeats)

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
  }

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser's default full-page form submit
    if (status === 'loading') return

    const { ok, errors: errs, clean } = validateRegistration(values)
    if (!ok) {
      setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])))
      document.getElementById(FIELDS.find((f) => errs[f]))?.focus()
      return
    }

    setStatus('loading')
    setServerError('')
    try {
      const data = await postJson('/api/register', {
        ...clean,
        company_website: values.company_website, // honeypot, see api/register.js
        source: getSource(),
      })
      navigate('/thanks', { state: { name: clean.name, duplicate: data.duplicate } })
    } catch (err) {
      if (err.status === 403) setBlocked('closed')
      else if (err.status === 409) setBlocked('full')
      setServerError(err.message)
      setStatus('error')
    }
  }

  if (isClosed || isFull) {
    return (
      <div role="status">
        <h3>{isFull && !isClosed ? 'All seats are taken' : 'Registration has closed'}</h3>
        <p>
          {isFull && !isClosed
            ? 'Thank you for the interest. This workshop is full.'
            : 'Thank you for the interest. Registration for this workshop is over.'}{' '}
          You can still score an AI project and enter the lucky draw.
        </p>
        <Button to="/submit">Try the Score Calculator</Button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-describedby="register-error">
      <Field
        id="name"
        label="Full name"
        required
        autoComplete="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={showError('name')}
      />
      <Field
        id="email"
        label="Email"
        type="email"
        inputMode="email"
        required
        autoComplete="email"
        hint="The organizers will email the joining link here before the workshop."
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={showError('email')}
      />
      <Field
        id="college"
        label="College"
        required
        autoComplete="organization"
        value={values.college}
        onChange={handleChange}
        onBlur={handleBlur}
        error={showError('college')}
      />
      <Field
        as="select"
        id="year"
        label="Year of study"
        required
        value={values.year}
        onChange={handleChange}
        onBlur={handleBlur}
        error={showError('year')}
      >
        <option value="">Select your year</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y.replace(/^./, (c) => c.toUpperCase())} B.Tech
          </option>
        ))}
      </Field>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            value={values.company_website}
            onChange={handleChange}
          />
        </label>
      </div>

      {status === 'error' && (
        <div id="register-error" className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <Button type="submit" block loading={status === 'loading'}>
        {status === 'loading' ? 'Reserving your seat...' : status === 'error' ? 'Try again' : 'Reserve my free seat'}
      </Button>
      <p className="field__hint" style={{ textAlign: 'center', margin: 0 }}>
        Free. No spam. Open to 3rd &amp; 4th year B.Tech students.
      </p>
    </form>
  )
}
