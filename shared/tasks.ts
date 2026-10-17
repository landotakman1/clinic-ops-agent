import { z } from 'zod'
import {
  taskEventTypes,
  taskPriorities,
  taskStatuses,
  taskTypes,
  type TaskEventPayload,
} from './domain.ts'

// `satisfies` keeps this runtime schema and the TaskEventPayload type (used by
// the jsonb column) from drifting apart without a second source of truth.
export const taskEventPayloadSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('created') }),
  z.object({
    kind: z.literal('status_changed'),
    from: z.enum(taskStatuses),
    to: z.enum(taskStatuses),
  }),
  z.object({ kind: z.literal('note'), text: z.string() }),
  z.object({
    kind: z.literal('webhook'),
    source: z.string(),
    receivedAt: z.string(),
  }),
  z.object({ kind: z.literal('agent_completed'), agentRunId: z.string() }),
]) satisfies z.ZodType<TaskEventPayload>

// Query params are strings on the wire, so `limit` is coerced.
export const taskListQuerySchema = z.object({
  clinic_id: z.uuid().optional(),
  status: z.enum(taskStatuses).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})
export type TaskListQuery = z.infer<typeof taskListQuerySchema>

// Strict: clients cannot set status or createdBy; the server owns those.
export const createTaskInputSchema = z.strictObject({
  clinicId: z.uuid(),
  type: z.enum(taskTypes),
  priority: z.enum(taskPriorities).default('medium'),
  summary: z.string().trim().min(1).max(500),
})
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>

export const taskListItemSchema = z.object({
  id: z.uuid(),
  clinic: z.object({ id: z.uuid(), name: z.string() }),
  type: z.enum(taskTypes),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  summary: z.string(),
  createdBy: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type TaskListItem = z.infer<typeof taskListItemSchema>

export const taskEventSchema = z.object({
  id: z.uuid(),
  eventType: z.enum(taskEventTypes),
  payload: taskEventPayloadSchema,
  createdAt: z.iso.datetime(),
})
export type TaskEventDto = z.infer<typeof taskEventSchema>

export const taskDetailSchema = taskListItemSchema.extend({
  events: z.array(taskEventSchema),
})
export type TaskDetail = z.infer<typeof taskDetailSchema>

export const taskListResponseSchema = z.object({
  tasks: z.array(taskListItemSchema),
})
export type TaskListResponse = z.infer<typeof taskListResponseSchema>
