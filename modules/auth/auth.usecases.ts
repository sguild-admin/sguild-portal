import {
  getAppUserByClerkUserId,
  getOrganizationByClerkOrgId,
  getOrgMembershipByOrgIdAndClerkUserId,
} from "./auth.repo"
import { ForbiddenError, NotFoundError } from "@/lib/errors"

export type Actor = {
  clerkUserId: string
  isSuperAdmin: boolean
}

export async function buildActor(clerkUserId: string): Promise<Actor> {
  const appUser = await getAppUserByClerkUserId(clerkUserId)
  return { clerkUserId, isSuperAdmin: !!appUser?.isSuperAdmin }
}

export async function getActorFromClerk(input: { clerkUserId: string; clerkOrgId?: string }) {
  const actor = await buildActor(input.clerkUserId)
  return { ...actor, clerkOrgId: input.clerkOrgId }
}

export async function requireSuperAdmin(clerkUserId: string) {
  const actor = await buildActor(clerkUserId)
  if (!actor.isSuperAdmin) throw new ForbiddenError("Requires super admin")
  return actor
}

export async function requireOrgAdmin(clerkUserId: string, clerkOrgId: string) {
  const org = await getOrganizationByClerkOrgId(clerkOrgId)
  if (!org) throw new NotFoundError("Organization not found")

  const membership = await getOrgMembershipByOrgIdAndClerkUserId(org.id, clerkUserId)
  if (!membership || membership.status !== "ACTIVE" || membership.role !== "ADMIN") {
    throw new ForbiddenError("Requires active org admin")
  }

  return { org, membership }
}

export async function requireCoachOrAdmin(clerkUserId: string, clerkOrgId: string) {
  const org = await getOrganizationByClerkOrgId(clerkOrgId)
  if (!org) throw new NotFoundError("Organization not found")

  const membership = await getOrgMembershipByOrgIdAndClerkUserId(org.id, clerkUserId)
  if (!membership || membership.status !== "ACTIVE") {
    throw new ForbiddenError("Requires active membership")
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    throw new ForbiddenError("Requires coach or admin role")
  }

  return { org, membership }
}
