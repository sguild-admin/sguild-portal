// modules/coach-profiles/coach-profiles.service.ts
import { AppError } from "@/lib/http/errors"
import { requireActiveOrgId, requireAdminOrOwner, requireSession, requireSuperAdmin } from "@/lib/auth/guards"
import { membersRepo } from "@/modules/members/members.repo"
import { coachProfilesRepo } from "./coach-profiles.repo"

type UpsertCoachProfileInput = Partial<{
  nickname: string | null
  bio: string | null
  notes: string | null
  address: string | null
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
    return coachProfilesRepo.getByOrgUser(orgId, session.userId)
  },

  async getByUserId(headers: Headers, userId: string) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    return coachProfilesRepo.getByOrgUser(orgId, userId)
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

  async enableCoach(headers: Headers, input: { orgId: string; userId: string }) {
    try {
      await requireSuperAdmin(headers)
    } catch {
      await requireAdminOrOwner(headers)
    }

    const member = await membersRepo.getByOrgUser(input.orgId, input.userId)
    if (!member) throw new AppError("NOT_FOUND", "Member not found")

    return coachProfilesRepo.upsertStatus(input.orgId, input.userId, "ACTIVE")
  },

  async disableCoach(headers: Headers, input: { orgId: string; userId: string }) {
    try {
      await requireSuperAdmin(headers)
    } catch {
      await requireAdminOrOwner(headers)
    }

    const profile = await coachProfilesRepo.upsertStatus(input.orgId, input.userId, "DISABLED")

    const member = await membersRepo.getByOrgUser(input.orgId, input.userId)
    if (member && member.role === "member" && member.status === "ACTIVE") {
      await membersRepo.setStatus(input.orgId, input.userId, "DISABLED")
    }

    return profile
  },
}
