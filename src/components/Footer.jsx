import { Link } from 'react-router-dom'
import { EVENT } from '../lib/config.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__row">
        <div>
          <strong>{EVENT.title}</strong>
          <p style={{ margin: '0.3rem 0 0' }}>
            Free for {EVENT.audience}. Built as a submission for the NxtWave Growth Challenge simulation.
          </p>
        </div>
        <nav aria-label="Footer">
          <Link to="/">Workshop</Link> · <Link to="/submit">Score Calculator</Link>
        </nav>
      </div>
    </footer>
  )
}
