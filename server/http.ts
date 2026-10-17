import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { z } from 'zod'
import type { ApiError } from '../shared/api.ts'

export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  issues?: NonNullable<ApiError['error']['issues']>,
) {
  const body: ApiError = { error: { code, message, issues } }
  return c.json(body, status)
}

export function validationError(c: Context, error: z.ZodError) {
  return jsonError(
    c,
    400,
    'invalid_request',
    'Request validation failed',
    error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    })),
  )
}
