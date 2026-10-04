const IST = 'Asia/Kolkata'

/** "Mon, 12 Oct" */
export function formatDate(iso) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: IST,
  }).format(new Date(iso))
}

/** "7:00 PM IST" */
export function formatTime(iso) {
  const t = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST,
  }).format(new Date(iso))
  return `${t.toUpperCase()} IST`
}

export const rupees = (n) => `₹${n.toLocaleString('en-IN')}`
