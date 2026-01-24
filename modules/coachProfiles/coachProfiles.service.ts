// modules/coachProfiles/coachProfiles.service.ts
// Domain logic for coach profile records.
import "server-only"

import type { CoachProfile } from "@prisma/client"
import { coachProfilesRepo } from "@/modules/coachProfiles/coachProfiles.repo"

// Service layer for coach profiles.
export const coachProfilesService = {
  // Lookup by app user id.
  async getByAppUserId(appUserId: string): Promise<CoachProfile | null> {
    return coachProfilesRepo.getByAppUserId(appUserId)
  },

  // Create or update profile by app user id.
  async upsertByAppUserId(
    appUserId: string,
    data: { bio?: string | null; notes?: string | null; zip?: string | null; phone?: string | null }
  ) {
    return coachProfilesRepo.upsertByAppUserId(appUserId, data)
  },
}
