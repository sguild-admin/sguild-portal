import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { coachProfilesRepo } from "@/modules/coach-profiles"
import { coachAvailabilityRepo } from "./coach-availability.repo"
import type { CoachAvailabilityListInput } from "./coach-availability.schema"

export const coachAvailabilityService = {
  async listMine(headers: Headers) {
    const session = await requireSession(headers)
    const orgId = await requireActiveOrgId(headers)
    const profile = await coachProfilesRepo.ensure(orgId, session.userId)
    return coachAvailabilityRepo.listByCoachProfileId(profile.id)
  },

  async setMine(headers: Headers, slots: CoachAvailabilityListInput) {
    const session = await requireSession(headers)
    const orgId = await requireActiveOrgId(headers)
    const profile = await coachProfilesRepo.ensure(orgId, session.userId)
    return coachAvailabilityRepo.replaceForCoachProfile(profile.id, slots)
  },

  async listForUser(headers: Headers, userId: string) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    const profile = await coachProfilesRepo.ensure(orgId, userId)
    return coachAvailabilityRepo.listByCoachProfileId(profile.id)
  },

  async setForUser(headers: Headers, userId: string, slots: CoachAvailabilityListInput) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    const profile = await coachProfilesRepo.ensure(orgId, userId)
    return coachAvailabilityRepo.replaceForCoachProfile(profile.id, slots)
  },
}
