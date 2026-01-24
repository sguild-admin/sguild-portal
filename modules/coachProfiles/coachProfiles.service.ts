import "server-only"

import type { CoachProfile } from "@prisma/client"
import { coachProfilesRepo } from "@/modules/coachProfiles/coachProfiles.repo"

export const coachProfilesService = {
  async getByAppUserId(appUserId: string): Promise<CoachProfile | null> {
    return coachProfilesRepo.getByAppUserId(appUserId)
  },

  async upsertByAppUserId(
    appUserId: string,
    data: { bio?: string | null; notes?: string | null; zip?: string | null }
  ) {
    return coachProfilesRepo.upsertByAppUserId(appUserId, data)
  },
}
