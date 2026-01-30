import { prisma } from "@/lib/db/prisma"
import type { Weekday } from "@prisma/client"
import type { CoachAvailabilityDto } from "./coach-availability.dto"
import type { CoachAvailabilitySlotInput } from "./coach-availability.schema"

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part))
  return hours * 60 + minutes
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const WEEKDAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

function numberToWeekday(value: number): Weekday {
  return WEEKDAYS[value]
}

function weekdayToNumber(value: Weekday): number {
  return WEEKDAYS.indexOf(value)
}

function toDto(row: { id: string; dayOfWeek: Weekday; startMin: number; endMin: number }): CoachAvailabilityDto {
  return {
    id: row.id,
    dayOfWeek: weekdayToNumber(row.dayOfWeek),
    startTime: minutesToTime(row.startMin),
    endTime: minutesToTime(row.endMin),
  }
}

export const coachAvailabilityRepo = {
  async listByCoachProfileId(coachProfileId: string) {
    const rows = await prisma.coachAvailability.findMany({
      where: { coachProfileId },
      orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }],
      select: { id: true, dayOfWeek: true, startMin: true, endMin: true },
    })
    return rows.map(toDto)
  },

  async replaceForCoachProfile(coachProfileId: string, slots: CoachAvailabilitySlotInput[]) {
    return prisma.$transaction(async (tx) => {
      await tx.coachAvailability.deleteMany({ where: { coachProfileId } })
      if (slots.length === 0) return []
      await tx.coachAvailability.createMany({
        data: slots.map((slot) => ({
          coachProfileId,
          dayOfWeek: numberToWeekday(slot.dayOfWeek),
          startMin: timeToMinutes(slot.startTime),
          endMin: timeToMinutes(slot.endTime),
        })),
      })
      const rows = await tx.coachAvailability.findMany({
        where: { coachProfileId },
        orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }],
        select: { id: true, dayOfWeek: true, startMin: true, endMin: true },
      })
      return rows.map(toDto)
    })
  },
}
