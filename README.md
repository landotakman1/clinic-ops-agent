# Clinic Ops Workflow Agent

Internal operations tool for multi-clinic healthcare workflows. React + Vite
frontend, Hono + TypeScript API, PostgreSQL via Drizzle ORM, shared Zod types.

## Scripts

- `npm run dev` — Vite frontend at http://localhost:5173 (proxies `/api` to the backend)
- `npm run dev:server` — Hono API at http://localhost:3001
- `npm run typecheck` — strict TypeScript project references
- `npm run build` — typecheck and production frontend build
- `npm run db:generate` — create a SQL migration from `server/db/schema.ts`
- `npm run db:migrate` — apply migrations in `drizzle/`
- `npm run db:seed` — load sample clinics, users, and tasks (destructive locally)
- `npm run db:studio` — inspect tables in Drizzle Studio

Health check: `GET /api/health`

## Database

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Start Postgres (local Docker): `docker compose up -d`
3. Apply schema: `npm run db:migrate`
4. Load sample data: `npm run db:seed`

After schema edits, run `npm run db:generate` then `npm run db:migrate` again.
Do not edit generated SQL by hand unless you know why the snapshot would drift.

`npm run db:seed` deletes existing `agent_runs`, `task_events`, `tasks`,
`users`, and `clinics` rows, then inserts the sample set. Use it only against
a local or disposable database.
