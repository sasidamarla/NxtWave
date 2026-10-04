/**
 * SHARED VALIDATION
 * The browser uses this for instant feedback (good UX).
 * The server uses the SAME file to re-check everything (real security).
 * Rule of thumb: never trust the browser. Anyone can skip your form and
 * call /api/* directly, so the server must validate on its own.
 */

export const YEARS = ['3rd year', '4th year']

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 120 },
  college: { min: 2, max: 120 },
  title: { min: 2, max: 100 },
  link: { max: 300 },
  description: { min: 40, max: 1500 },
}

// Simple, forgiving email check. The only real proof an email works is sending to it.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const str = (v) => (typeof v === 'string' ? v.trim() : '')

export function isValidEmail(email) {
  return EMAIL_RE.test(email) && email.length <= LIMITS.email.max
}

export function isValidHttpUrl(value) {
  try {
    const u = new URL(value)
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.')
  } catch {
    return false
  }
}

function checkLength(errors, key, value, label) {
  const { min = 0, max } = LIMITS[key]
  if (value.length < min) errors[key] = `${label} must be at least ${min} characters.`
  else if (value.length > max) errors[key] = `${label} must be under ${max} characters.`
}

/** Returns { ok, errors, clean }. `clean` is the trimmed, normalised data. */
export function validateRegistration(input = {}) {
  const clean = {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    college: str(input.college),
    year: str(input.year),
  }
  const errors = {}

  if (!clean.name) errors.name = 'Please enter your name.'
  else checkLength(errors, 'name', clean.name, 'Name')

  if (!clean.email) errors.email = 'Please enter your email.'
  else if (!isValidEmail(clean.email)) errors.email = 'That email doesn’t look right. Check for typos.'

  if (!clean.college) errors.college = 'Please enter your college.'
  else checkLength(errors, 'college', clean.college, 'College name')

  if (!clean.year) errors.year = 'Please choose your year.'
  else if (!YEARS.includes(clean.year)) errors.year = 'Please choose 3rd year or 4th year.'

  return { ok: Object.keys(errors).length === 0, errors, clean }
}

/** Validation for the Project Score Calculator. */
export function validateSubmission(input = {}) {
  const clean = {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    title: str(input.title),
    link: str(input.link),
    description: str(input.description),
  }
  const errors = {}

  if (!clean.name) errors.name = 'Please enter your name.'
  else checkLength(errors, 'name', clean.name, 'Name')

  if (!clean.email) errors.email = 'Please enter your email (we use it for the lucky draw).'
  else if (!isValidEmail(clean.email)) errors.email = 'That email doesn’t look right. Check for typos.'

  if (!clean.title) errors.title = 'Give your project a title.'
  else checkLength(errors, 'title', clean.title, 'Title')

  // Rule: at least one of link / description is required.
  if (!clean.link && !clean.description) {
    errors.link = 'Add a project link or a description (or both).'
    errors.description = 'Add a description or a project link (or both).'
  }

  if (clean.link) {
    if (clean.link.length > LIMITS.link.max) errors.link = 'That link is too long.'
    else if (!isValidHttpUrl(clean.link)) errors.link = 'Enter a full link starting with http:// or https://'
  }

  if (clean.description) {
    checkLength(errors, 'description', clean.description, 'Description')
  }

  return { ok: Object.keys(errors).length === 0, errors, clean }
}
