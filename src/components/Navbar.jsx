import { Link, NavLink } from 'react-router-dom'
import Button from './Button.jsx'
import { EVENT } from '../lib/config.js'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label={`${EVENT.shortTitle} home`}>
          <span className="navbar__logo" aria-hidden="true">AI</span>
          <span>{EVENT.shortTitle}</span>
        </Link>

        <nav className="navbar__links" aria-label="Main">
          <NavLink to="/" end className="navbar__link navbar__link--hide-sm">
            Workshop
          </NavLink>
          <NavLink to="/submit" className="navbar__link">
            Score Calculator
          </NavLink>
          <Button to="/#register" size="sm">
            Join free
          </Button>
        </nav>
      </div>
    </header>
  )
}
