import type { CoachAvailability, CoachProfile, User, Weekday } from "@prisma/client"
import type { CoachAvailabilityDto } from "@/modules/coach-availability/coach-availability.dto"

export type CoachStatus = "ACTIVE" | "DISABLED"

export type CoachProfileDto = {
  id: string
  orgId: string
  userId: string
  status: CoachStatus
  nickname: string | null
  bio: string | null
  notes: string | null
  address: string | null
  zip: string | null
  phone: string | null
  availability?: CoachAvailabilityDto[]
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
}

const WEEKDAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function weekdayToNumber(value: Weekday): number {
  return WEEKDAYS.indexOf(value)
}

export function toCoachProfileDto(
  p: CoachProfile & { user?: User | null; availabilities?: CoachAvailability[] }
): CoachProfileDto {
  return {
    id: p.id,
    orgId: p.orgId,
    userId: p.userId,
    status: p.status as CoachStatus,
    nickname: p.nickname,
    bio: p.bio,
    notes: p.notes,
    address: p.address,
    zip: p.zip,
    phone: p.phone,
    availability: p.availabilities?.map((slot) => ({
      id: slot.id,
      dayOfWeek: weekdayToNumber(slot.dayOfWeek),
      startTime: minutesToTime(slot.startMin),
      endTime: minutesToTime(slot.endMin),
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    user: p.user
      ? {
          id: p.user.id,
          email: p.user.email,
          name: p.user.name ?? null,
          image: p.user.image ?? null,
        }
      : undefined,
  }
}
