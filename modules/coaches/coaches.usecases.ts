import { requireOrgAdmin } from "@/modules/auth/auth.usecases"
import { disableMember } from "@/modules/memberships/memberships.usecases"
import { getOrganizationByClerkOrgId } from "@/modules/org/org.repo"
import { BadRequestError } from "@/lib/errors"

export async function inviteCoach(actor: { clerkUserId: string }, input: { clerkOrgId: string; email: string }) {
  await requireOrgAdmin(actor.clerkUserId, input.clerkOrgId)

  if (!input.email || input.email.trim().length === 0) throw new BadRequestError("email is required")

  const org = await getOrganizationByClerkOrgId(input.clerkOrgId)
  if (!org) throw new BadRequestError("Organization not found")

  // Real implementation would map email -> clerkUserId (invite flow). For now, create an INVITED membership placeholder by email is unsupported.
  return { ok: true, invited: true, email: input.email }
}

export async function disableCoach(actor: { clerkUserId: string }, input: { clerkOrgId: string; coachId: string }) {
  await requireOrgAdmin(actor.clerkUserId, input.clerkOrgId)

  if (!input.coachId) throw new BadRequestError("coachId required")

  // coachId expected to be membershipId
  return disableMember(input.coachId)
}

export async function listCoaches(actor: { clerkUserId: string; isSuperAdmin?: boolean }, clerkOrgId: string) {
  const org = await getOrganizationByClerkOrgId(clerkOrgId)
  if (!org) return []

  const members = await import("@/modules/memberships/memberships.repo").then(m => m.listMembersByOrgId(org.id))

  // filter coaches
  return members.filter((m: unknown) => {
    const mm = m as { role?: string }
    return mm.role === "COACH"
  })
}
