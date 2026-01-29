import { prisma } from "@/lib/db/prisma"
import type { CoachAvailabilitySlotInput } from "./coach-availability.schema"

export const coachAvailabilityRepo = {
  listByCoachProfileId(coachProfileId: string) {
    return prisma.coachAvailability.findMany({
      where: { coachProfileId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
  },

  replaceForCoachProfile(coachProfileId: string, slots: CoachAvailabilitySlotInput[]) {
    return prisma.$transaction(async (tx) => {
      await tx.coachAvailability.deleteMany({ where: { coachProfileId } })
      if (slots.length === 0) return []
      await tx.coachAvailability.createMany({
        data: slots.map((slot) => ({
          coachProfileId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      })
      return tx.coachAvailability.findMany({
        where: { coachProfileId },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })
    })
  },
}
