import 'dotenv/config'
import { serve } from '@hono/node-server'
import { createApp } from './app.ts'
import { createDb } from './db/client.ts'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT ?? ''}`)
}

const { db } = createDb()
const app = createApp(db)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`)
})
