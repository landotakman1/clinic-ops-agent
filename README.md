# Clinic Ops Workflow Agent

Internal operations tool for multi-clinic healthcare workflows. React + Vite
frontend, Hono + TypeScript API, shared Zod types.

## Scripts

- `npm run dev` — Vite frontend at http://localhost:5173 (proxies `/api` to the backend)
- `npm run dev:server` — Hono API at http://localhost:3001
- `npm run typecheck` — strict TypeScript project references
- `npm run build` — typecheck and production frontend build

Health check: `GET /api/health`
