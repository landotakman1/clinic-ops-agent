import { z } from 'zod'

// Placeholder identity header until JWT/session auth replaces it.
export const DEV_USER_HEADER = 'x-user-id'

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional(),
  }),
})
export type ApiError = z.infer<typeof apiErrorSchema>
