import { useLocation } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import { EVENT, LUCKY_DRAW } from '../lib/config.js'
import { formatDate, formatTime, rupees } from '../lib/format.js'
import { shareOrWhatsapp, siteOrigin } from '../lib/share.js'

export default function Thanks() {
  // The form passes { name, duplicate } through router state. Visiting /thanks directly has none.
  const { state } = useLocation()
  const name = state?.name?.split(' ')[0]

  function handleShare() {
    shareOrWhatsapp({
      text: `I just reserved a free seat in "${EVENT.title}" (${formatDate(EVENT.workshopStart)}, ${formatTime(EVENT.workshopStart)}). Prizes up to ${rupees(1000)}. Join me:`,
      url: `${siteOrigin()}/?src=share`,
    })
  }

  return (
    <div className="container thanks">
      <Card tone="brand">
        <span className="section__kicker">{state?.duplicate ? 'Already in' : "You're in"}</span>
        <h1>{name ? `Thanks, ${name}!` : 'Thanks for registering!'}</h1>
        <p className="section__intro">
          {state?.duplicate
            ? 'This email was already registered, so your seat is safe. No need to sign up again.'
            : "Your seat is reserved. The organizers will email the joining link to the address you gave, before the workshop."}
        </p>
        <p>
          <strong>{formatDate(EVENT.workshopStart)}, {formatTime(EVENT.workshopStart)}</strong>, {EVENT.durationMinutes} minutes, online.
        </p>
      </Card>

      <div className="grid grid--2" style={{ marginTop: '1.5rem' }}>
        <Card>
          <h3>Warm up now ⚡</h3>
          <p>
            Score any AI project you have in seconds and enter the {rupees(LUCKY_DRAW.amount)} lucky draw.
          </p>
          <Button to="/submit">Open Score Calculator</Button>
        </Card>
        <Card tone="pop">
          <h3>Bring a friend 🤝</h3>
          <p>Workshops are better with a friend. Send them the link on WhatsApp.</p>
          <Button variant="secondary" onClick={handleShare}>Share on WhatsApp</Button>
        </Card>
      </div>
    </div>
  )
}
