import type { CoachAvailability, CoachProfile, User } from "@prisma/client"
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
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
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
