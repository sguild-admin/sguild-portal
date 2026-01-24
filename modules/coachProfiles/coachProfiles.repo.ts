import "server-only"

import { prisma } from "@/lib/prisma"
import type { CoachProfile, Prisma } from "@prisma/client"

type Db = Prisma.TransactionClient | typeof prisma

export const coachProfilesRepo = {
  async getByAppUserId(appUserId: string, db: Db = prisma): Promise<CoachProfile | null> {
    return db.coachProfile.findUnique({ where: { appUserId } })
  },

  async upsertByAppUserId(
    appUserId: string,
    data: { bio?: string | null; notes?: string | null; zip?: string | null },
    db: Db = prisma
  ): Promise<CoachProfile> {
    return db.coachProfile.upsert({
      where: { appUserId },
      create: {
        appUserId,
        bio: data.bio ?? null,
        notes: data.notes ?? null,
        zip: data.zip ?? null,
      },
      update: {
        bio: data.bio ?? undefined,
        notes: data.notes ?? undefined,
        zip: data.zip ?? undefined,
      },
    })
  },
}
