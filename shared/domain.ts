export const clinicStatuses = ['active', 'inactive'] as const
export type ClinicStatus = (typeof clinicStatuses)[number]

export const userRoles = ['admin', 'clinic_manager', 'viewer'] as const
export type UserRole = (typeof userRoles)[number]

export const taskTypes = [
  'staffing',
  'inventory',
  'billing',
  'compliance',
  'followup',
] as const
export type TaskType = (typeof taskTypes)[number]

export const taskStatuses = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'cancelled',
] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const taskPriorities = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof taskPriorities)[number]

export const taskEventTypes = [
  'created',
  'status_changed',
  'note_added',
  'webhook_received',
  'agent_completed',
] as const
export type TaskEventType = (typeof taskEventTypes)[number]

export const agentRunStatuses = [
  'pending',
  'running',
  'completed',
  'failed',
] as const
export type AgentRunStatus = (typeof agentRunStatuses)[number]

export type TaskEventPayload =
  | { kind: 'created' }
  | { kind: 'status_changed'; from: TaskStatus; to: TaskStatus }
  | { kind: 'note'; text: string }
  | { kind: 'webhook'; source: string; receivedAt: string }
  | { kind: 'agent_completed'; agentRunId: string }

export type AgentToolCall = {
  name: string
  arguments: Record<string, unknown>
  result?: unknown
}
