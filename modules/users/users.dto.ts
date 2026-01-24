// modules/users/users.dto.ts
import type { AppUser } from "@prisma/client"

export type AppUserDTO = {
  id: string
  clerkUserId: string
  primaryEmail: string | null
  firstName: string | null
  lastName: string | null
  displayName: string | null
  phone: string | null
  avatarUrl: string | null
  isDisabled: boolean
  lastSignInAt: Date | null
  lastSeenAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export function toAppUserDTO(u: AppUser): AppUserDTO {
  return {
    id: u.id,
    clerkUserId: u.clerkUserId,
    primaryEmail: u.primaryEmail ?? null,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    displayName: u.displayName ?? null,
    phone: u.phone ?? null,
    avatarUrl: u.avatarUrl ?? null,
    isDisabled: u.isDisabled,
    lastSignInAt: u.lastSignInAt ?? null,
    lastSeenAt: u.lastSeenAt ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
