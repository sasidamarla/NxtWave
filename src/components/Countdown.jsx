import { useEffect, useState } from 'react'

function remaining(targetIso) {
  const ms = Math.max(0, new Date(targetIso).getTime() - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    done: ms === 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

/**
 * Ticks once per second. The key idea: we never "count down" by subtracting 1.
 * Every tick recomputes (target - now), so if the phone sleeps or the tab is
 * throttled, the timer is still correct when it wakes up.
 */
export default function Countdown({ target, doneText = 'Registration is closed' }) {
  const [t, setT] = useState(() => remaining(target))

  useEffect(() => {
    const id = setInterval(() => setT(remaining(target)), 1000)
    return () => clearInterval(id) // cleanup: stop the timer when the component unmounts
  }, [target])

  if (t.done) return <p className="countdown__done">{doneText}</p>

  const units = [
    ['Days', t.days],
    ['Hours', t.hours],
    ['Mins', t.minutes],
    ['Secs', t.seconds],
  ]

  return (
    <div className="countdown" role="timer" aria-label="Time left to register">
      {units.map(([label, value]) => (
        <div className="countdown__unit" key={label}>
          <span className="countdown__num">{String(value).padStart(2, '0')}</span>
          <span className="countdown__label">{label}</span>
        </div>
      ))}
    </div>
  )
}
