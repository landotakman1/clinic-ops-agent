import { useEffect, useState } from 'react'
import type { TaskStatus } from '../../shared/domain.ts'
import {
  taskListResponseSchema,
  type TaskListItem,
} from '../../shared/tasks.ts'
import { apiGet } from '../api/client.ts'

export type TaskFilters = {
  clinicId?: string
  status?: TaskStatus
}

type SettledState =
  | { status: 'ok'; tasks: TaskListItem[] }
  | { status: 'error'; message: string }

type TasksState = { status: 'loading' } | SettledState

export function useTasks({ clinicId, status }: TaskFilters): TasksState {
  const params = new URLSearchParams()
  if (clinicId) params.set('clinic_id', clinicId)
  if (status) params.set('status', status)
  const path = `/api/tasks?${params.toString()}`

  // Results are keyed by the request path, so "loading" is derived when the
  // filters change instead of being set inside the effect.
  const [result, setResult] = useState<{
    path: string
    state: SettledState
  } | null>(null)

  useEffect(() => {
    // Aborting on filter change stops a slow earlier response from
    // overwriting a newer one.
    const controller = new AbortController()

    apiGet(path, taskListResponseSchema, controller.signal)
      .then((data) => {
        setResult({ path, state: { status: 'ok', tasks: data.tasks } })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setResult({
          path,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      })

    return () => controller.abort()
  }, [path])

  if (!result || result.path !== path) {
    return { status: 'loading' }
  }

  return result.state
}
