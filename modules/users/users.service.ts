// modules/users/users.service.ts
import "server-only"

import type { AppUser } from "@prisma/client"
import { usersRepo } from "@/modules/users/users.repo"

type ClerkUserResource = {
  id: string
  primaryEmailAddress?: { emailAddress?: string | null } | null
  primaryPhoneNumber?: { phoneNumber?: string | null } | null
  imageUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  username?: string | null
  lastSignInAt?: number | null
  lastActiveAt?: number | null
  banned?: boolean
  locked?: boolean
}

function toDisplayName(input: { fullName?: string | null; firstName?: string | null; lastName?: string | null; username?: string | null }) {
  if (input.fullName) return input.fullName
  const full = [input.firstName, input.lastName].filter(Boolean).join(" ").trim()
  return full || input.username || null
}

export const usersService = {
  async getByClerkUserId(clerkUserId: string): Promise<AppUser | null> {
    return usersRepo.getByClerkUserId(clerkUserId)
  },

  async getOrCreateByClerkUserId(clerkUserId: string): Promise<AppUser> {
    return usersRepo.getOrCreateByClerkUserId(clerkUserId)
  },

  async upsertFromClerkUser(input: {
    clerkUserId: string
    primaryEmail?: string | null
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    phone?: string | null
    avatarUrl?: string | null
    isDisabled?: boolean
    lastSignInAt?: Date | null
    lastSeenAt?: Date | null
  }): Promise<AppUser> {
    return usersRepo.upsertByClerkUserId(input)
  },

  async upsertFromClerkUserResource(resource: ClerkUserResource): Promise<AppUser> {
    return usersRepo.upsertByClerkUserId({
      clerkUserId: resource.id,
      primaryEmail: resource.primaryEmailAddress?.emailAddress ?? null,
      firstName: resource.firstName ?? null,
      lastName: resource.lastName ?? null,
      displayName: toDisplayName({
        fullName: resource.fullName ?? null,
        firstName: resource.firstName ?? null,
        lastName: resource.lastName ?? null,
        username: resource.username ?? null,
      }),
      phone: resource.primaryPhoneNumber?.phoneNumber ?? null,
      avatarUrl: resource.imageUrl ?? null,
      lastSignInAt: typeof resource.lastSignInAt === "number" ? new Date(resource.lastSignInAt) : null,
      lastSeenAt: typeof resource.lastActiveAt === "number" ? new Date(resource.lastActiveAt) : null,
      isDisabled: !!(resource.banned || resource.locked),
    })
  },

}
