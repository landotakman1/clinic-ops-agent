import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthResponseSchema } from '../shared/health.ts'
import type { Database } from './db/client.ts'
import { jsonError } from './http.ts'
import { createTaskRoutes } from './routes/tasks.ts'

export function createApp(db: Database) {
  const app = new Hono()

  app.use(
    '/api/*',
    cors({
      origin: ['http://localhost:5173'],
    }),
  )

  app.get('/api/health', (c) => {
    const body = healthResponseSchema.parse({
      status: 'ok',
      service: 'clinic-ops-agent',
      timestamp: new Date().toISOString(),
    })

    return c.json(body)
  })

  app.route('/api/tasks', createTaskRoutes(db))

  app.onError((error, c) => {
    console.error(error)
    return jsonError(c, 500, 'internal_error', 'Unexpected server error')
  })

  return app
}
