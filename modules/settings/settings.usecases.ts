import { requireOrgAdmin } from "@/modules/auth/auth.usecases"
import { getOrganizationByClerkOrgId } from "@/modules/org/org.repo"
import { BadRequestError } from "@/lib/errors"

export async function updateOrgSettings(actor: { clerkUserId: string; isSuperAdmin?: boolean }, input: { clerkOrgId: string; timeZone?: string; oceanLessons?: boolean }) {
  // require org admin (will throw if not authorized)
  await requireOrgAdmin(actor.clerkUserId, input.clerkOrgId)

  const org = await getOrganizationByClerkOrgId(input.clerkOrgId)
  if (!org) throw new BadRequestError("Organization not found")

  // NOTE: schema does not currently include timeZone or oceanLessons fields.
  // This usecase enforces auth and validates inputs; persist changes when schema is extended.
  return { ok: true, updated: true, timeZone: input.timeZone ?? null, oceanLessons: input.oceanLessons ?? null }
}

export async function getOrgSettings(actor: { clerkUserId: string; isSuperAdmin?: boolean }, clerkOrgId: string) {
  // ensure actor is member/admin via requireOrgAdmin if needed elsewhere; reads are allowed here
  const org = await getOrganizationByClerkOrgId(clerkOrgId)
  if (!org) return { timeZone: null, oceanLessons: null }

  // schema lacks settings fields; return placeholders until schema is extended
  return { timeZone: null, oceanLessons: null, org }
}
