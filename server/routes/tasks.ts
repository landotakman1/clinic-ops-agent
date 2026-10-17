import { and, desc, eq, type SQL } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  createTaskInputSchema,
  taskListQuerySchema,
  type TaskDetail,
  type TaskListItem,
  type TaskListResponse,
} from '../../shared/tasks.ts'
import { authenticate, canAccessClinic, requireRole, type AuthEnv } from '../auth.ts'
import type { Database } from '../db/client.ts'
import {
  clinics,
  taskEvents,
  tasks,
  type Clinic,
  type Task,
  type TaskEvent,
} from '../db/schema.ts'
import { jsonError, validationError } from '../http.ts'

type ClinicRef = Pick<Clinic, 'id' | 'name'>

function toTaskListItem(task: Task, clinic: ClinicRef): TaskListItem {
  return {
    id: task.id,
    clinic: { id: clinic.id, name: clinic.name },
    type: task.type,
    status: task.status,
    priority: task.priority,
    summary: task.summary,
    createdBy: task.createdBy,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

function toTaskDetail(
  task: Task,
  clinic: ClinicRef,
  events: TaskEvent[],
): TaskDetail {
  return {
    ...toTaskListItem(task, clinic),
    events: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
    })),
  }
}

export function createTaskRoutes(db: Database) {
  const routes = new Hono<AuthEnv>()

  routes.use('*', authenticate(db))

  routes.get('/', async (c) => {
    const query = taskListQuerySchema.safeParse(c.req.query())

    if (!query.success) {
      return validationError(c, query.error)
    }

    const { clinic_id: requestedClinicId, status, limit } = query.data
    const user = c.get('user')

    if (requestedClinicId && !canAccessClinic(user, requestedClinicId)) {
      return jsonError(c, 403, 'forbidden', 'No access to that clinic')
    }

    // Non-admins are pinned to their clinic even when they omit the filter,
    // so "no filter" can never mean "every clinic" for them.
    const clinicId = user.role === 'admin' ? requestedClinicId : user.clinicId

    const conditions: SQL[] = []
    if (clinicId) conditions.push(eq(tasks.clinicId, clinicId))
    if (status) conditions.push(eq(tasks.status, status))

    // One flat SELECT ... INNER JOIN: every task has exactly one clinic, so
    // the join cannot multiply rows, and (clinic_id, status) filters hit
    // tasks_clinic_id_status_idx. id is a tiebreaker for a stable order.
    const rows = await db
      .select({ task: tasks, clinic: { id: clinics.id, name: clinics.name } })
      .from(tasks)
      .innerJoin(clinics, eq(clinics.id, tasks.clinicId))
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt), desc(tasks.id))
      .limit(limit)

    const body: TaskListResponse = {
      tasks: rows.map((row) => toTaskListItem(row.task, row.clinic)),
    }

    return c.json(body)
  })

  routes.get('/:id', async (c) => {
    // Reject non-UUIDs here; Postgres would otherwise throw a 500 on the cast.
    const params = z.object({ id: z.uuid() }).safeParse(c.req.param())

    if (!params.success) {
      return validationError(c, params.error)
    }

    // Relational query: Drizzle builds one statement that nests events as a
    // JSON array, instead of a join that repeats the task row per event.
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, params.data.id),
      with: {
        clinic: { columns: { id: true, name: true } },
        events: {
          orderBy: (events, { asc }) => [asc(events.createdAt), asc(events.id)],
        },
      },
    })

    // 404 rather than 403 for another clinic's task, so ids can't be probed.
    if (!task || !canAccessClinic(c.get('user'), task.clinicId)) {
      return jsonError(c, 404, 'not_found', 'Task not found')
    }

    const { clinic, events, ...row } = task

    return c.json(toTaskDetail(row, clinic, events))
  })

  routes.post('/', requireRole('admin', 'clinic_manager'), async (c) => {
    const json: unknown = await c.req.json().catch(() => undefined)
    const input = createTaskInputSchema.safeParse(json)

    if (!input.success) {
      return validationError(c, input.error)
    }

    const user = c.get('user')

    if (!canAccessClinic(user, input.data.clinicId)) {
      return jsonError(c, 403, 'forbidden', 'No access to that clinic')
    }

    // Checked up front so callers get a 422 instead of an FK-violation 500.
    const clinic = await db.query.clinics.findFirst({
      where: eq(clinics.id, input.data.clinicId),
      columns: { id: true, name: true, status: true },
    })

    if (!clinic) {
      return jsonError(c, 422, 'unknown_clinic', 'Clinic does not exist')
    }

    if (clinic.status !== 'active') {
      return jsonError(c, 422, 'clinic_inactive', 'Clinic is not active')
    }

    // Task and its "created" audit event commit together or not at all.
    const created = await db.transaction(async (tx) => {
      const [task] = await tx
        .insert(tasks)
        .values({ ...input.data, createdBy: user.id })
        .returning()

      if (!task) throw new Error('Task insert returned no row')

      const [event] = await tx
        .insert(taskEvents)
        .values({
          taskId: task.id,
          eventType: 'created',
          payload: { kind: 'created' },
        })
        .returning()

      if (!event) throw new Error('Task event insert returned no row')

      return { task, event }
    })

    return c.json(toTaskDetail(created.task, clinic, [created.event]), 201)
  })

  return routes
}
