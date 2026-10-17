# Clinic Ops Workflow Agent — Project Context

## Purpose

Portfolio project that demonstrates every core technical requirement of the AI Solutions Engineer / Product Builder role at Confluent Health (Business Technology team reporting to the CIO). The project is an internal operations tool for multi-clinic healthcare environments.

## Job Requirements Being Demonstrated

| Requirement | Demonstration in This Project |
|-------------|-------------------------------|
| TypeScript (primary, strong fluency) | Entire stack in strict TypeScript. Shared types, discriminated unions, typed agent tools. |
| React (functional components, hooks, data-driven) | Dashboard, multi-step forms, custom data hooks. |
| REST APIs, OAuth-style auth, webhooks, permissions | Typed endpoints, role-based access, webhook status updates, documented auth edge cases. |
| SQL / PostgreSQL (schema, joins, aggregates, performance) | Normalized schema, indexed queries, dashboard aggregates. |
| LLM / Agentic AI (tool-calling, prompts, agent loops) | Multi-step agent with tools, persistent run history, clear prompt strategy. |

## High-Level Architecture

1. User submits a structured request via React form.
2. Backend validates with Zod, checks permissions, creates a `tasks` row in PostgreSQL.
3. Agent is invoked with task context. It may call tools (lookup data, query similar tasks, create follow-up, record note).
4. Full agent run is persisted in `agent_runs`.
5. Dashboard queries PostgreSQL (joins + aggregates) to show status.
6. Webhook endpoint can update task status from outside the app.

## Core Data Model (Simplified)

- **clinics** — id, name, region, status
- **users** — id, email, role (admin | clinic_manager | viewer), clinic_id
- **tasks** — id, clinic_id, type, status, priority, created_by, summary, timestamps
- **task_events** — id, task_id, event_type, payload (JSONB)
- **agent_runs** — id, task_id, status, prompt_snapshot, tool_calls (JSONB), final_output, timestamps

Indexes on `tasks(clinic_id, status)`, `tasks(created_at)`, and `agent_runs(task_id)`.

## Agent Design

- Tools: `lookup_clinic_data`, `query_similar_tasks`, `create_followup_task`, `record_resolution_note`
- System prompt emphasizes operational clarity, using tools when data is needed, and producing a concise final summary.
- Loop continues until the model returns a final answer instead of a tool call.
- Every step is logged for auditability and debugging.

## Recommended Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Node.js + TypeScript (Hono or Express) + Zod
- Database: PostgreSQL (Neon recommended) + Drizzle ORM or Prisma
- Agent: OpenAI or Anthropic API with tool calling
- Auth: Simple JWT or session with role claims
- Hosting: Vercel (frontend + serverless) or similar

## Development Principles

- Strict TypeScript from the start. Shared types between frontend and backend.
- Validate at every boundary (Zod on API inputs).
- Permission checks before any data access.
- Agent tools are typed and their results are validated.
- Document design decisions so they can be explained in interviews.
- Use AI for scaffolding and boilerplate; own the architecture, agent loop, and permission logic.

## Current Status

Project is in the planning and initial setup phase. No production code has been written yet. The developer is building this to strengthen an application for the AI Solutions Engineer / Product Builder role and wants to be able to explain every technology and decision at an expert level.

## Key Files in This Workspace

- `Clinic_Ops_Workflow_Agent_Proposal.docx` — Full project proposal and feature list
- `Clinic_Ops_Step_by_Step_Workflow.docx` — Detailed build workflow with expert explanations
- `CLAUDE_INSTRUCTIONS.md` — Instructions for AI assistants working on this project
- `CLAUDE_CONTEXT.md` — This file
