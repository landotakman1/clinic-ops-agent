import { relations } from 'drizzle-orm'
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import {
  agentRunStatuses,
  clinicStatuses,
  taskEventTypes,
  taskPriorities,
  taskStatuses,
  taskTypes,
  userRoles,
  type AgentToolCall,
  type TaskEventPayload,
} from '../../shared/domain.ts'

export const clinicStatusEnum = pgEnum('clinic_status', clinicStatuses)
export const userRoleEnum = pgEnum('user_role', userRoles)
export const taskTypeEnum = pgEnum('task_type', taskTypes)
export const taskStatusEnum = pgEnum('task_status', taskStatuses)
export const taskPriorityEnum = pgEnum('task_priority', taskPriorities)
export const taskEventTypeEnum = pgEnum('task_event_type', taskEventTypes)
export const agentRunStatusEnum = pgEnum('agent_run_status', agentRunStatuses)

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}

export const clinics = pgTable('clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  region: text('region').notNull(),
  status: clinicStatusEnum('status').notNull().default('active'),
  ...timestamps,
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    role: userRoleEnum('role').notNull(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'restrict' }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    index('users_clinic_id_idx').on(table.clinicId),
  ],
)

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'restrict' }),
    type: taskTypeEnum('type').notNull(),
    status: taskStatusEnum('status').notNull().default('open'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    summary: text('summary').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Dashboard filters: open/in-progress work for a clinic.
    index('tasks_clinic_id_status_idx').on(table.clinicId, table.status),
    // Recency sorts and "created this week" aggregates.
    index('tasks_created_at_idx').on(table.createdAt),
    index('tasks_created_by_idx').on(table.createdBy),
  ],
)

export const taskEvents = pgTable(
  'task_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    eventType: taskEventTypeEnum('event_type').notNull(),
    payload: jsonb('payload').$type<TaskEventPayload>().notNull(),
    ...timestamps,
  },
  (table) => [index('task_events_task_id_idx').on(table.taskId)],
)

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    status: agentRunStatusEnum('status').notNull().default('pending'),
    promptSnapshot: text('prompt_snapshot').notNull(),
    toolCalls: jsonb('tool_calls').$type<AgentToolCall[]>().notNull(),
    finalOutput: text('final_output'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [index('agent_runs_task_id_idx').on(table.taskId)],
)

export const clinicsRelations = relations(clinics, ({ many }) => ({
  users: many(users),
  tasks: many(tasks),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [users.clinicId],
    references: [clinics.id],
  }),
  createdTasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [tasks.clinicId],
    references: [clinics.id],
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  events: many(taskEvents),
  agentRuns: many(agentRuns),
}))

export const taskEventsRelations = relations(taskEvents, ({ one }) => ({
  task: one(tasks, {
    fields: [taskEvents.taskId],
    references: [tasks.id],
  }),
}))

export const agentRunsRelations = relations(agentRuns, ({ one }) => ({
  task: one(tasks, {
    fields: [agentRuns.taskId],
    references: [tasks.id],
  }),
}))

export type Clinic = typeof clinics.$inferSelect
export type NewClinic = typeof clinics.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type TaskEvent = typeof taskEvents.$inferSelect
export type NewTaskEvent = typeof taskEvents.$inferInsert
export type AgentRun = typeof agentRuns.$inferSelect
export type NewAgentRun = typeof agentRuns.$inferInsert
