import type { z } from 'zod'
import { apiErrorSchema, DEV_USER_HEADER } from '../../shared/api.ts'

// PLACEHOLDER: the seeded admin user. Swap for a real session/JWT once auth
// exists; the server derives role and clinic scope from this id.
const DEV_USER_ID = '55555555-5555-4555-8555-555555555555'

export async function apiGet<T extends z.ZodType>(
  path: string,
  schema: T,
  signal?: AbortSignal,
): Promise<z.output<T>> {
  const response = await fetch(path, {
    signal,
    headers: { [DEV_USER_HEADER]: DEV_USER_ID },
  })
  const body: unknown = await response.json().catch(() => undefined)

  if (!response.ok) {
    const apiError = apiErrorSchema.safeParse(body)
    throw new Error(
      apiError.success
        ? apiError.data.error.message
        : `Request failed (${response.status})`,
    )
  }

  // Parse rather than cast: a contract drift fails loudly here, not in JSX.
  return schema.parse(body)
}
