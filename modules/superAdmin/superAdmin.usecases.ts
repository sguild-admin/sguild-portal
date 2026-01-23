
import { setAppUserSuperAdmin, findAppUserByClerkUserId } from "./superAdmin.repo"
import { NotFoundError } from "@/lib/errors"
import { requireSuperAdmin } from "@/modules/auth/auth.usecases"
import { upsertMembershipAssignAdmin } from "@/modules/memberships/memberships.repo"

export async function toggleSuperAdmin(clerkUserId: string, enable: boolean) {
  return setAppUserSuperAdmin(clerkUserId, enable)
}

export async function getSuperAdminStatus(clerkUserId: string) {
  const u = await findAppUserByClerkUserId(clerkUserId)
  if (!u) throw new NotFoundError("AppUser not found")
  return u.isSuperAdmin
}

// New usecase that accepts an actor object to set super admin (enforces requester is super admin)
export async function setSuperAdmin(actor: { clerkUserId: string }, input: { clerkUserId: string; isSuperAdmin: boolean }) {
  await requireSuperAdmin(actor.clerkUserId)
  return setAppUserSuperAdmin(input.clerkUserId, input.isSuperAdmin)
}

export async function assignOrgAdmin(actor: { clerkUserId: string }, input: { orgId: string; clerkUserId: string }) {
  await requireSuperAdmin(actor.clerkUserId)
  // upsert membership to ADMIN + ACTIVE
  return upsertMembershipAssignAdmin(input.orgId, input.clerkUserId)
}

export async function listOrgs(actor: { clerkUserId: string }) {
  await requireSuperAdmin(actor.clerkUserId)
  const { listOrganizations } = await import("@/modules/org/org.repo")
  return listOrganizations()
}
