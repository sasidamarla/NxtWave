/**
 * SOURCE TRACKING (the growth part)
 * Share links like  https://your-site.vercel.app/?src=wa-ece-3rdyr  .
 * We remember "src" for the session and send it with every registration,
 * so the Google Sheet can answer: which channel actually brought signups?
 */

const KEY = 'src'

export function captureSource() {
  try {
    const params = new URLSearchParams(window.location.search)
    const src = params.get('src') || params.get('utm_source')
    if (src) sessionStorage.setItem(KEY, src.slice(0, 40))
  } catch {
    // Private mode / blocked storage: tracking is a nice-to-have, never a blocker.
  }
}

export function getSource() {
  try {
    return sessionStorage.getItem(KEY) || 'direct'
  } catch {
    return 'direct'
  }
}
