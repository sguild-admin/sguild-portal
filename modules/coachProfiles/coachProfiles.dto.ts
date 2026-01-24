import type { CoachProfile } from "@prisma/client"

export type CoachProfileDTO = {
  id: string
  appUserId: string
  bio: string | null
  notes: string | null
  zip: string | null
  createdAt: Date
  updatedAt: Date
}

export function toCoachProfileDTO(profile: CoachProfile): CoachProfileDTO {
  return {
    id: profile.id,
    appUserId: profile.appUserId,
    bio: profile.bio ?? null,
    notes: profile.notes ?? null,
    zip: profile.zip ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
}
