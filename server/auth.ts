import { eq } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'
import { z } from 'zod'
import { DEV_USER_HEADER } from '../shared/api.ts'
import type { UserRole } from '../shared/domain.ts'
import type { Database } from './db/client.ts'
import { users, type User } from './db/schema.ts'
import { jsonError } from './http.ts'

export type AuthUser = Pick<User, 'id' | 'role' | 'clinicId'>

export type AuthEnv = {
  Variables: { user: AuthUser }
}

// PLACEHOLDER: trusts a user id sent in a header and loads that user's role
// from the database. Anyone can impersonate anyone. Replace with a verified
// JWT/session whose claims carry the user id before this leaves localhost.
export function authenticate(db: Database) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const userId = z.uuid().safeParse(c.req.header(DEV_USER_HEADER))

    if (!userId.success) {
      return jsonError(
        c,
        401,
        'unauthenticated',
        `Missing or invalid ${DEV_USER_HEADER} header`,
      )
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId.data),
      columns: { id: true, role: true, clinicId: true },
    })

    if (!user) {
      return jsonError(c, 401, 'unauthenticated', 'Unknown user')
    }

    c.set('user', user)
    await next()
  })
}

// Must run after authenticate(); it reads the user that middleware set.
export function requireRole(...roles: readonly UserRole[]) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const { role } = c.get('user')

    if (!roles.includes(role)) {
      return jsonError(
        c,
        403,
        'forbidden',
        `Role ${role} cannot perform this action`,
      )
    }

    await next()
  })
}

// Admins see every clinic; everyone else is limited to their own.
export function canAccessClinic(user: AuthUser, clinicId: string): boolean {
  return user.role === 'admin' || user.clinicId === clinicId
}
