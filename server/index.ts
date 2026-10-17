import { serve } from '@hono/node-server'
import { app } from './app.ts'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT ?? ''}`)
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`)
})
