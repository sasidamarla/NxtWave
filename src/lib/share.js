/** WhatsApp is the primary channel, so sharing is a first-class feature. */

export function siteOrigin() {
  return window.location.origin
}

export function whatsappLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/**
 * Use the phone's native share sheet when available (great on mobile),
 * otherwise fall back to a WhatsApp link. Returns 'shared' | 'whatsapp' | 'cancelled'.
 */
export async function shareOrWhatsapp({ text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ text, url })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
    }
  }
  window.open(whatsappLink(`${text} ${url}`), '_blank', 'noopener,noreferrer')
  return 'whatsapp'
}
