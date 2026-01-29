// lib/auth/guards.ts
import { prisma } from "@/lib/db/prisma"
import { auth } from "./auth"
import { AppError } from "@/lib/http/errors"
import { coachProfilesRepo } from "@/modules/coach-profiles/coach-profiles.repo"
import { membersRepo } from "@/modules/members/members.repo"

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>

function getSessionOrThrow(result: SessionResult) {
  if (!result?.session) throw new AppError("UNAUTHENTICATED", "Not authenticated")
  return result.session
}

function forbidden(message: string) {
  return new AppError("FORBIDDEN", message)
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
export async function requireActiveMember(orgId: string, userId: string) {
  const member = await membersRepo.getByOrgUser(orgId, userId)
  if (!member || member.status !== "ACTIVE") throw forbidden("No org access")
  return member
}

export async function requireAdminOrOwner(orgId: string, userId: string): Promise<unknown>
export async function requireAdminOrOwner(headers: Headers): Promise<unknown>
export async function requireAdminOrOwner(
  orgIdOrHeaders: string | Headers,
  userId?: string
) {
  if (typeof orgIdOrHeaders !== "string") {
    const session = await requireSession(orgIdOrHeaders)
    const orgId = await requireActiveOrgId(orgIdOrHeaders)
    return requireAdminOrOwner(orgId, session.userId)
  }

  const member = await requireActiveMember(orgIdOrHeaders, userId ?? "")
  if (member.role !== "admin" && member.role !== "owner") {
    throw forbidden("Not admin")
  }
  return member
}

/**
 * Back-compat alias if older code imports requireAdmin
 * Remove later once everything is migrated
 */
export const requireAdmin = requireAdminOrOwner

export async function requireActiveCoach(orgId: string, userId: string) {
  await requireActiveMember(orgId, userId)
  const coach = await coachProfilesRepo.getByOrgUser(orgId, userId)
  if (!coach || coach.status !== "ACTIVE") throw forbidden("Not coach")
  return coach
}

export async function requireSuperAdmin(headers: Headers) {
  const result = await auth.api.getSession({ headers })
  if (!result?.session || !result.user?.id) throw new AppError("UNAUTHENTICATED")

  const row = await prisma.superAdmin.findUnique({
    where: { userId: result.user.id },
    select: { id: true },
  })

  if (!row) throw new AppError("FORBIDDEN")

  return { session: result.session, superAdminId: row.id }
}

