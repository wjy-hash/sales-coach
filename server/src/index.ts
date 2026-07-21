import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import cors from 'cors'
import { chatRouter } from './routes/chat'
import { mistakesRouter } from './routes/mistakes'
import { speechRouter } from './routes/speech'
import { initData } from './services/storage'

export function createApp() {
  const app = express()

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
  app.use(express.json({ limit: '5mb' }))

  // Initialize JSON data files
  initData()

  // API routes
  app.use('/api/chat', chatRouter)
  app.use('/api/mistakes', mistakesRouter)
  app.use('/api/speech', speechRouter)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Serve static frontend in production (only if built)
  const staticDir =
    process.env.STATIC_DIR || path.resolve(__dirname, '..', '..', 'client', 'dist')
  const indexPath = path.join(staticDir, 'index.html')

  if (fs.existsSync(indexPath)) {
    app.use(express.static(staticDir))
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(indexPath)
    })
  }

  return app
}

// Auto-start when run directly (node/tsx), not when required by Electron
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`[server] Sales Coach API running on http://localhost:${PORT}`)
  })
}
