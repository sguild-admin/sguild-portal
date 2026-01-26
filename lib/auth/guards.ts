// lib/auth/guards.ts
import { prisma } from "@/lib/db/prisma"
import { auth } from "./auth"
import { AppError } from "@/lib/http/errors"

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>

function getSessionOrThrow(result: SessionResult) {
  if (!result?.session) throw new AppError("UNAUTHENTICATED", "Not authenticated")
  return result.session
}

export async function requireSession(headers: Headers) {
  const result = await auth.api.getSession({ headers })
  return getSessionOrThrow(result)
}

export async function requireActiveOrgId(headers: Headers) {
  const session = await requireSession(headers)
  if (!session.activeOrganizationId) throw new AppError("FORBIDDEN", "No active organization")
  return session.activeOrganizationId
}

export async function getActiveRoles(headers: Headers) {
  const session = await requireSession(headers)
  return (session as { roles?: string[] }).roles ?? []
}

/**
 * Preferred guard name per project rules
 */
export async function requireAdminOrOwner(headers: Headers) {
  const roles = await getActiveRoles(headers)
  if (!roles.includes("admin") && !roles.includes("owner")) {
    throw new AppError("FORBIDDEN", "Admin or owner required")
  }
}

/**
 * Back-compat alias if older code imports requireAdmin
 * Remove later once everything is migrated
 */
export const requireAdmin = requireAdminOrOwner

export async function requireSuperAdmin(headers: Headers) {
  const session = await requireSession(headers).catch(() => {
    throw new AppError("UNAUTHENTICATED")
  })

  const row = await prisma.superAdmin.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  })

  if (!row) throw new AppError("FORBIDDEN")

  return { session, superAdminId: row.id }
}

