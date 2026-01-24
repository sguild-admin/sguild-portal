// modules/users/users.service.ts
// Domain logic for AppUser records.
import "server-only"

import type { AppUser } from "@prisma/client"
import { usersRepo } from "@/modules/users/users.repo"

// Subset of Clerk user fields we care about for syncing.
type ClerkUserResource = {
  id: string
  primaryEmailAddress?: { emailAddress?: string | null } | null
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

// Normalize display name with graceful fallback.
function toDisplayName(input: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
}) {
  if (input.fullName) return input.fullName
  const full = [input.firstName, input.lastName].filter(Boolean).join(" ").trim()
  return full || input.username || null
}

// Service layer for users (no request/auth logic here).
export const usersService = {
  // Lookup by Clerk user id.
  async getByClerkUserId(clerkUserId: string): Promise<AppUser | null> {
    return usersRepo.getByClerkUserId(clerkUserId)
  },

  // Ensure a local user record exists.
  async getOrCreateByClerkUserId(clerkUserId: string): Promise<AppUser> {
    return usersRepo.getOrCreateByClerkUserId(clerkUserId)
  },

  // Upsert from normalized Clerk user data.
  async upsertFromClerkUser(input: {
    clerkUserId: string
    primaryEmail?: string | null
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    isDisabled?: boolean
    lastSignInAt?: Date | null
    lastSeenAt?: Date | null
  }): Promise<AppUser> {
    return usersRepo.upsertByClerkUserId(input)
  },

  // Upsert directly from a Clerk user resource payload.
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
      lastSignInAt: typeof resource.lastSignInAt === "number" ? new Date(resource.lastSignInAt) : null,
      lastSeenAt: typeof resource.lastActiveAt === "number" ? new Date(resource.lastActiveAt) : null,
      isDisabled: !!(resource.banned || resource.locked),
    })
  },

  // Update a user's display name by Clerk user id.
  async updateDisplayNameByClerkUserId(
    clerkUserId: string,
    displayName: string | null
  ): Promise<AppUser> {
    return usersRepo.upsertByClerkUserId({ clerkUserId, displayName })
  },

  // Remove user records by Clerk user id.
  async deleteByClerkUserId(clerkUserId: string): Promise<void> {
    await usersRepo.deleteByClerkUserId(clerkUserId)
  },
}
