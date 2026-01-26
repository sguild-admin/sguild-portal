// modules/coach-profiles/coach-profiles.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { coachProfilesRepo } from "./coach-profiles.repo"

type UpsertCoachProfileInput = Partial<{
  bio: string | null
  notes: string | null
  zip: string | null
  phone: string | null
}>

type CoachStatus = "ACTIVE" | "DISABLED"

export const coachProfilesService = {
  async listForOrg(headers: Headers) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    return coachProfilesRepo.listByOrg(orgId)
  },

  async getMine(headers: Headers) {
    const session = await requireSession(headers)
    const orgId = await requireActiveOrgId(headers)
    return coachProfilesRepo.getByUserAndOrg(orgId, session.userId)
  },

  async getByUserId(headers: Headers, userId: string) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    return coachProfilesRepo.getByUserAndOrg(orgId, userId)
  },

  async upsertMine(headers: Headers, input: UpsertCoachProfileInput) {
    const session = await requireSession(headers)
    const orgId = await requireActiveOrgId(headers)
    return coachProfilesRepo.upsert(orgId, session.userId, input)
  },

  async setStatus(headers: Headers, input: { userId: string; status: CoachStatus }) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    return coachProfilesRepo.setStatus(orgId, input.userId, input.status as any)
  },
}
