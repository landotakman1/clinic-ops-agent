import { useHealth } from './hooks/useHealth.ts'

function App() {
  const health = useHealth()

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
