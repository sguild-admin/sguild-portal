// modules/users/users.dto.ts
// DTOs for AppUser records.
import type { AppUser } from "@prisma/client"

// Public-facing user representation.
export type AppUserDTO = {
  id: string
  clerkUserId: string
  primaryEmail: string | null
  firstName: string | null
  lastName: string | null
  displayName: string | null
  isDisabled: boolean
  lastSignInAt: Date | null
  lastSeenAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Map Prisma AppUser to AppUserDTO.
export function toAppUserDTO(u: AppUser): AppUserDTO {
  return {
    id: u.id,
    clerkUserId: u.clerkUserId,
    primaryEmail: u.primaryEmail ?? null,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    displayName: u.displayName ?? null,
    isDisabled: u.isDisabled,
    lastSignInAt: u.lastSignInAt ?? null,
    lastSeenAt: u.lastSeenAt ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
