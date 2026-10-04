import { useEffect, useState } from 'react'
import { getJson } from './api.js'

/**
 * One shared fetch of /api/stats for the whole page (seat bar AND registration form).
 * The module-level `pending` promise means two components asking at once cause ONE request.
 * Returns null while loading, then { closed, total, simulated, count? }.
 */
let pending = null

export function useStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    pending ??= getJson('/api/stats')
    pending.then((data) => {
      if (cancelled) return
      // If the stats call fails, don't block people: assume open and show simulated numbers.
      setStats(data ?? { closed: false, simulated: true })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return stats
}
