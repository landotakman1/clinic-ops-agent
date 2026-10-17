import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { getDatabaseUrl } from './env.ts'
import * as schema from './schema.ts'

export function createDb(url = getDatabaseUrl()) {
  const client = postgres(url)
  const db = drizzle(client, { schema })

  return { client, db }
}

export type Database = ReturnType<typeof createDb>['db']
