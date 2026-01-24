// modules/coachProfiles/coachProfiles.dto.ts
// DTOs for coach profile records.
import type { CoachProfile } from "@prisma/client"

// Public-facing coach profile representation.
export type CoachProfileDTO = {
  id: string
  appUserId: string
  bio: string | null
  notes: string | null
  zip: string | null
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

// Map Prisma CoachProfile to CoachProfileDTO.
export function toCoachProfileDTO(profile: CoachProfile): CoachProfileDTO {
  return {
    id: profile.id,
    appUserId: profile.appUserId,
    bio: profile.bio ?? null,
    notes: profile.notes ?? null,
    zip: profile.zip ?? null,
    phone: profile.phone ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
}
