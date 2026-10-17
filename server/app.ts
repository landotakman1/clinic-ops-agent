import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthResponseSchema } from '../shared/health.ts'

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

export { app }
