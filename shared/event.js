/**
 * EVENT RULES THE SERVER ENFORCES
 * These two values live in shared/ (not in src/) because both the browser and the
 * server need them. The server uses them to REJECT late or overflow registrations,
 * so someone calling /api/register directly can't bypass what the page shows.
 *
 * Dates use +05:30 (IST) so every visitor and the server agree on the same moment.
 */
export const REGISTRATION_CLOSES = '2026-10-11T23:59:00+05:30'
export const TOTAL_SEATS = 500

export function registrationClosed(now = Date.now()) {
  // OPEN_REGISTRATION=1 lets you keep demoing/testing after the real deadline.
  if (typeof process !== 'undefined' && process.env?.OPEN_REGISTRATION === '1') return false
  return now > Date.parse(REGISTRATION_CLOSES)
}

/** MAX_SEATS (env) exists mainly so tests can use a tiny cap. */
export function maxSeats() {
  const fromEnv = typeof process !== 'undefined' ? Number(process.env?.MAX_SEATS) : NaN
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : TOTAL_SEATS
}
