import type { CoachProfile, User } from "@prisma/client"

export type CoachStatus = "ACTIVE" | "DISABLED"

export type CoachProfileDto = {
  id: string
  orgId: string
  userId: string
  status: CoachStatus
  bio: string | null
  notes: string | null
  zip: string | null
  phone: string | null
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
  p: CoachProfile & { user?: User | null }
): CoachProfileDto {
  return {
    id: p.id,
    orgId: p.orgId,
    userId: p.userId,
    status: p.status as CoachStatus,
    bio: p.bio,
    notes: p.notes,
    zip: p.zip,
    phone: p.phone,
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
