import { EVENT } from '../lib/config.js'
import { useStats } from '../lib/useStats.js'

/**
 * HONEST SEAT COUNTER
 * 1. Uses the real registration count from /api/stats (from the Sheet) when available.
 * 2. Otherwise shows a SIMULATED number and says so on screen.
 * Fake urgency presented as real is a trust risk; labelled demo data is fine.
 */
function simulatedTaken() {
  const hoursSinceStart = (Date.now() - new Date(EVENT.campaignStart).getTime()) / 36e5
  const grown = 120 + Math.floor(Math.max(0, hoursSinceStart) * 3)
  return Math.min(Math.round(EVENT.totalSeats * 0.94), grown)
}

export default function SeatsLeft() {
  const stats = useStats()
  const loading = stats === null
  const simulated = loading || stats.simulated !== false || !Number.isFinite(stats.count)

  const total = EVENT.totalSeats
  const taken = Math.min(loading ? 0 : simulated ? simulatedTaken() : stats.count, total)
  const left = total - taken
  const pct = Math.round((taken / total) * 100)

  return (
    <div className="seats">
      <div className="seats__top">
        <strong className="seats__left">{loading ? '...' : left === 0 ? 'Fully booked' : `${left} seats left`}</strong>
        <span>{taken} of {total} taken</span>
      </div>
      <div
        className="seats__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={taken}
        aria-label="Seats taken"
      >
        <div className="seats__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="seats__note">
        {loading ? 'Checking seats...' : simulated ? 'Demo counter (simulated for this challenge).' : 'Live count.'}
      </p>
    </div>
  )
}
