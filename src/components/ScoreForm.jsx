import { useMemo, useState } from 'react'
import Button from './Button.jsx'
import Field from './Field.jsx'
import { LIMITS, validateSubmission } from '../../shared/validation.js'

const EMPTY = { name: '', email: '', title: '', link: '', description: '', company_website: '' }
const FIELDS = ['name', 'email', 'title', 'link', 'description']

/**
 * Same pattern as RegisterForm (controlled inputs, derived errors, touched-on-blur),
 * plus one extra rule: "link OR description" must be filled. That rule lives in
 * shared/validation.js so the browser and the server enforce the identical rule.
 */
export default function ScoreForm({ initialValues, loading, serverError, onSubmit }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues })
  const [touched, setTouched] = useState({})

  const { errors } = useMemo(() => validateSubmission(values), [values])
  const showError = (name) => (touched[name] ? errors[name] : undefined)

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }
  function handleBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    const { ok, errors: errs, clean } = validateSubmission(values)
    if (!ok) {
      setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])))
      document.getElementById(FIELDS.find((f) => errs[f]))?.focus()
      return
    }
    onSubmit(clean, values.company_website)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form__row">
        <Field id="name" label="Your name" required autoComplete="name"
          value={values.name} onChange={handleChange} onBlur={handleBlur} error={showError('name')} />
        <Field id="email" label="Email" type="email" inputMode="email" required autoComplete="email"
          hint="Used for the lucky draw. We won't spam you."
          value={values.email} onChange={handleChange} onBlur={handleBlur} error={showError('email')} />
      </div>

      <Field id="title" label="Project title" required maxLength={LIMITS.title.max}
        value={values.title} onChange={handleChange} onBlur={handleBlur} error={showError('title')} />

      <Field id="link" label="Project link" type="url" inputMode="url" autoComplete="off"
        placeholder="https://..."
        hint="Live demo or GitHub repo. Add a link, a description, or both."
        value={values.link} onChange={handleChange} onBlur={handleBlur} error={showError('link')} />

      <Field as="textarea" id="description" label="Describe your project"
        counter={`${values.description.length}/${LIMITS.description.max}`}
        maxLength={LIMITS.description.max}
        placeholder="What does it do, who is it for, and how does AI power it?"
        hint="More detail = a more accurate score. The AI reads this text; it can't open your link yet."
        value={values.description} onChange={handleChange} onBlur={handleBlur} error={showError('description')} />

      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input name="company_website" tabIndex={-1} autoComplete="off"
            value={values.company_website} onChange={handleChange} />
        </label>
      </div>

      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <Button type="submit" block loading={loading}>
        {loading ? 'Scoring your project...' : serverError ? 'Try again' : 'Score my project'}
      </Button>
      <p className="field__hint" style={{ textAlign: 'center', margin: 0 }}>
        Privacy: only your project title, link and description are sent to a free AI service, which may log them. Your name and email are never sent to the AI.
      </p>
      {loading && (
        <p className="field__hint" style={{ textAlign: 'center', margin: 0 }} role="status">
          This usually takes 5 to 10 seconds.
        </p>
      )}
    </form>
  )
}
