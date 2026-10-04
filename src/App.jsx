import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import NotFound from './pages/NotFound.jsx'
import Submit from './pages/Submit.jsx'
import Thanks from './pages/Thanks.jsx'
import { captureSource } from './lib/tracking.js'

/** On a new page, start at the top (unless the link has a #hash to jump to). */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  // Remember ?src=... from the first page the visitor lands on.
  useEffect(() => {
    captureSource()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
