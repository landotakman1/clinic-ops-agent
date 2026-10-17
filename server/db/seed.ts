import 'dotenv/config'
import { createDb } from './client.ts'
import {
  agentRuns,
  clinics,
  taskEvents,
  tasks,
  users,
  type NewAgentRun,
  type NewClinic,
  type NewTask,
  type NewTaskEvent,
  type NewUser,
} from './schema.ts'

const ids = {
  clinics: {
    riverside: '11111111-1111-4111-8111-111111111111',
    harbor: '22222222-2222-4222-8222-222222222222',
    summit: '33333333-3333-4333-8333-333333333333',
    lakeside: '44444444-4444-4444-8444-444444444444',
  },
  users: {
    admin: '55555555-5555-4555-8555-555555555555',
    riversideManager: '66666666-6666-4666-8666-666666666666',
    harborManager: '77777777-7777-4777-8777-777777777777',
    harborViewer: '88888888-8888-4888-8888-888888888888',
    summitManager: '99999999-9999-4999-8999-999999999999',
  },
  tasks: {
    staffing: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    inventory: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    billing: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    compliance: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    followup: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    lakesideClosed: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  },
} as const

const clinicRows: NewClinic[] = [
  {
    id: ids.clinics.riverside,
    name: 'Riverside Family Medicine',
    region: 'Midwest',
    status: 'active',
  },
  {
    id: ids.clinics.harbor,
    name: 'Harbor Pediatrics',
    region: 'West',
    status: 'active',
  },
  {
    id: ids.clinics.summit,
    name: 'Summit Orthopedics',
    region: 'Northeast',
    status: 'active',
  },
  {
    id: ids.clinics.lakeside,
    name: 'Lakeside Urgent Care',
    region: 'South',
    status: 'inactive',
  },
]

const userRows: NewUser[] = [
  {
    id: ids.users.admin,
    email: 'admin@clinicops.local',
    role: 'admin',
    clinicId: ids.clinics.riverside,
  },
  {
    id: ids.users.riversideManager,
    email: 'manager@riverside.local',
    role: 'clinic_manager',
    clinicId: ids.clinics.riverside,
  },
  {
    id: ids.users.harborManager,
    email: 'manager@harbor.local',
    role: 'clinic_manager',
    clinicId: ids.clinics.harbor,
  },
  {
    id: ids.users.harborViewer,
    email: 'viewer@harbor.local',
    role: 'viewer',
    clinicId: ids.clinics.harbor,
  },
  {
    id: ids.users.summitManager,
    email: 'manager@summit.local',
    role: 'clinic_manager',
    clinicId: ids.clinics.summit,
  },
]

const taskRows: NewTask[] = [
  {
    id: ids.tasks.staffing,
    clinicId: ids.clinics.riverside,
    type: 'staffing',
    status: 'open',
    priority: 'urgent',
    createdBy: ids.users.riversideManager,
    summary: 'Cover Friday MA gap on the walk-in panel',
  },
  {
    id: ids.tasks.inventory,
    clinicId: ids.clinics.harbor,
    type: 'inventory',
    status: 'in_progress',
    priority: 'high',
    createdBy: ids.users.harborManager,
    summary: 'Pediatric vaccine fridge is below par for flu season',
  },
  {
    id: ids.tasks.billing,
    clinicId: ids.clinics.summit,
    type: 'billing',
    status: 'waiting',
    priority: 'medium',
    createdBy: ids.users.summitManager,
    summary: 'Clear denied claims older than 30 days',
  },
  {
    id: ids.tasks.compliance,
    clinicId: ids.clinics.riverside,
    type: 'compliance',
    status: 'resolved',
    priority: 'high',
    createdBy: ids.users.admin,
    summary: 'Complete HIPAA walkthrough before regional audit',
  },
  {
    id: ids.tasks.followup,
    clinicId: ids.clinics.harbor,
    type: 'followup',
    status: 'open',
    priority: 'low',
    createdBy: ids.users.harborViewer,
    summary: 'Call families with missed well-child visits last month',
  },
  {
    id: ids.tasks.lakesideClosed,
    clinicId: ids.clinics.lakeside,
    type: 'staffing',
    status: 'cancelled',
    priority: 'medium',
    createdBy: ids.users.admin,
    summary: 'Weekend coverage request cancelled after site inactivation',
  },
]

const taskEventRows: NewTaskEvent[] = [
  {
    taskId: ids.tasks.staffing,
    eventType: 'created',
    payload: { kind: 'created' },
  },
  {
    taskId: ids.tasks.inventory,
    eventType: 'created',
    payload: { kind: 'created' },
  },
  {
    taskId: ids.tasks.inventory,
    eventType: 'status_changed',
    payload: {
      kind: 'status_changed',
      from: 'open',
      to: 'in_progress',
    },
  },
  {
    taskId: ids.tasks.billing,
    eventType: 'created',
    payload: { kind: 'created' },
  },
  {
    taskId: ids.tasks.compliance,
    eventType: 'created',
    payload: { kind: 'created' },
  },
  {
    taskId: ids.tasks.compliance,
    eventType: 'status_changed',
    payload: {
      kind: 'status_changed',
      from: 'in_progress',
      to: 'resolved',
    },
  },
  {
    taskId: ids.tasks.followup,
    eventType: 'created',
    payload: { kind: 'created' },
  },
  {
    taskId: ids.tasks.lakesideClosed,
    eventType: 'created',
    payload: { kind: 'created' },
  },
]

const agentRunRows: NewAgentRun[] = [
  {
    taskId: ids.tasks.compliance,
    status: 'completed',
    promptSnapshot:
      'Review the HIPAA walkthrough task and record a concise resolution note.',
    toolCalls: [
      {
        name: 'lookup_clinic_data',
        arguments: { clinicId: ids.clinics.riverside },
        result: { name: 'Riverside Family Medicine', status: 'active' },
      },
      {
        name: 'record_resolution_note',
        arguments: {
          taskId: ids.tasks.compliance,
          note: 'Walkthrough complete; residual findings assigned to clinic manager.',
        },
      },
    ],
    finalOutput:
      'Audit prep is complete. Remaining findings are owned by the Riverside clinic manager.',
    completedAt: new Date(),
  },
  {
    taskId: ids.tasks.staffing,
    status: 'running',
    promptSnapshot:
      'Find similar staffing gaps and propose a follow-up if Friday coverage is still open.',
    toolCalls: [
      {
        name: 'query_similar_tasks',
        arguments: { type: 'staffing', clinicId: ids.clinics.riverside },
      },
    ],
    finalOutput: null,
  },
]

async function seed() {
  const { client, db } = createDb()

  try {
    await db.transaction(async (tx) => {
      await tx.delete(agentRuns)
      await tx.delete(taskEvents)
      await tx.delete(tasks)
      await tx.delete(users)
      await tx.delete(clinics)

      await tx.insert(clinics).values(clinicRows)
      await tx.insert(users).values(userRows)
      await tx.insert(tasks).values(taskRows)
      await tx.insert(taskEvents).values(taskEventRows)
      await tx.insert(agentRuns).values(agentRunRows)
    })

    console.log(
      `Seeded ${clinicRows.length} clinics, ${userRows.length} users, ${taskRows.length} tasks.`,
    )
  } finally {
    await client.end()
  }
}

void seed().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
