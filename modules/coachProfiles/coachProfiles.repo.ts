// modules/coachProfiles/coachProfiles.repo.ts
// Prisma-only data access for coach profiles.
import "server-only"

import { prisma } from "@/lib/prisma"
import type { CoachProfile, Prisma } from "@prisma/client"

// Allow passing a transaction or the root Prisma client.
type Db = Prisma.TransactionClient | typeof prisma

// Repository functions (no auth or validation).
export const coachProfilesRepo = {
  // Lookup by app user id.
  async getByAppUserId(appUserId: string, db: Db = prisma): Promise<CoachProfile | null> {
    return db.coachProfile.findUnique({ where: { appUserId } })
  },

  // Create or update a profile by app user id.
  async upsertByAppUserId(
    appUserId: string,
    data: { bio?: string | null; notes?: string | null; zip?: string | null; phone?: string | null },
    db: Db = prisma
  ): Promise<CoachProfile> {
    return db.coachProfile.upsert({
      where: { appUserId },
      create: {
        appUserId,
        bio: data.bio ?? null,
        notes: data.notes ?? null,
        zip: data.zip ?? null,
        phone: data.phone ?? null,
      },
      update: {
        bio: data.bio ?? undefined,
        notes: data.notes ?? undefined,
        zip: data.zip ?? undefined,
        phone: data.phone ?? undefined,
      },
    })
  },
}
