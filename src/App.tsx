import { useState } from 'react'
import { taskStatuses, type TaskStatus } from '../shared/domain.ts'
import { TaskTable } from './components/TaskTable.tsx'
import { formatLabel } from './format.ts'
import { useHealth } from './hooks/useHealth.ts'
import { useTasks } from './hooks/useTasks.ts'

function isTaskStatus(value: string): value is TaskStatus {
  return (taskStatuses as readonly string[]).includes(value)
}

function App() {
  const health = useHealth()
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined)
  const tasks = useTasks({ status })

  return (
    <main className="shell">
      <header className="header">
        <p className="eyebrow">Internal operations</p>
        <h1>Clinic Ops Workflow Agent</h1>
        <p className="lede">
          Submit clinic work, run a typed agent loop, and review status from a
          shared PostgreSQL-backed dashboard.
        </p>
      </header>

      <section className="panel" aria-labelledby="tasks-heading">
        <div className="panel-header">
          <h2 id="tasks-heading">Tasks</h2>
          <label className="filter">
            Status
            <select
              value={status ?? ''}
              onChange={(event) => {
                const { value } = event.target
                setStatus(isTaskStatus(value) ? value : undefined)
              }}
            >
              <option value="">All</option>
              {taskStatuses.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div aria-live="polite">
          {tasks.status === 'loading' ? <p>Loading tasks…</p> : null}
          {tasks.status === 'error' ? (
            <p>
              <span className="status-error">Could not load tasks</span>
              {' · '}
              {tasks.message}
            </p>
          ) : null}
          {tasks.status === 'ok' ? <TaskTable tasks={tasks.tasks} /> : null}
        </div>
      </section>

      <section className="panel" aria-live="polite">
        <h2>API status</h2>
        {health.status === 'loading' ? (
          <p>Checking backend health…</p>
        ) : null}
        {health.status === 'ok' ? (
          <p>
            <span className="status-ok">Healthy</span>
            {' · '}
            {health.data.service} · {health.data.timestamp}
          </p>
        ) : null}
        {health.status === 'error' ? (
          <p>
            <span className="status-error">Unavailable</span>
            {' · '}
            {health.message}. Start the API with <code>npm run dev:server</code>.
          </p>
        ) : null}
      </section>
    </main>
  )
}

export default App
