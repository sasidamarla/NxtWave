import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * LOCAL API PLUGIN
 * On Vercel, every file in /api becomes a serverless endpoint automatically.
 * `vite dev` doesn't know about that, so this plugin does the same job locally:
 * a request to /api/score loads api/score.js and calls its default export
 * with a (req, res) pair shaped like Vercel's. That way `npm run dev` runs the
 * whole app (frontend + backend) with no extra tools.
 */
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      // Load .env into process.env so api/*.js can read process.env.X, like on Vercel.
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (!(key in process.env)) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const name = req.url.slice('/api/'.length).split('?')[0]
        // Only simple names like "score" or "register": blocks "../" tricks.
        if (!/^[a-z-]+$/.test(name)) return next()

        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          try {
            req.body = raw ? JSON.parse(raw) : undefined
          } catch {
            req.body = undefined
          }

          // Tiny shims so handlers can call res.status(200).json({...}) like on Vercel.
          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }

          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          await mod.default(req, res)
        } catch (err) {
          console.error('[local-api]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Local API crashed. Check the terminal.' }))
        }
      })
    },
  }
}

/**
 * Share tags (og:image etc.) need an ABSOLUTE url. Vercel exposes the production
 * domain at build time, so we swap the __SITE_URL__ placeholder in index.html.
 */
function siteUrl() {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      const url =
        process.env.VITE_SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : '')
      return html.replaceAll('__SITE_URL__', url)
    },
  }
}

export default defineConfig({
  plugins: [react(), localApi(), siteUrl()],
})
