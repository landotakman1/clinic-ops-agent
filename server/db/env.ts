import { z } from 'zod'

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
})

export function getDatabaseUrl(): string {
  const parsed = dbEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.')
  }

  return parsed.data.DATABASE_URL
}
