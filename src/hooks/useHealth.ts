import { useEffect, useState } from 'react'
import {
  healthResponseSchema,
  type HealthResponse,
} from '../../shared/health.ts'

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; data: HealthResponse }
  | { status: 'error'; message: string }

export function useHealth(): HealthState {
  const [state, setState] = useState<HealthState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/health', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Health check failed (${response.status})`)
        }

        return healthResponseSchema.parse(await response.json())
      })
      .then((data) => {
        setState({ status: 'ok', data })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      })

    return () => controller.abort()
  }, [])

  return state
}
