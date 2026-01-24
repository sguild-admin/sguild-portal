// modules/users/users.repo.ts
// Prisma-only data access for AppUser records.
import "server-only"

import { prisma } from "@/lib/prisma"
import type { AppUser, Prisma } from "@prisma/client"

// Allow passing a transaction or the root Prisma client.
type Db = Prisma.TransactionClient | typeof prisma

// Repository functions (no auth or validation).
export const usersRepo = {
  // Lookup by internal id.
  async getById(id: string, db: Db = prisma): Promise<AppUser | null> {
    return db.appUser.findUnique({ where: { id } })
  },

  // Lookup by Clerk user id.
  async getByClerkUserId(clerkUserId: string, db: Db = prisma): Promise<AppUser | null> {
    return db.appUser.findUnique({ where: { clerkUserId } })
  },

  // Create a new AppUser with only the Clerk id set.
  async create(clerkUserId: string, db: Db = prisma): Promise<AppUser> {
    return db.appUser.create({ data: { clerkUserId } })
  },

  // Read existing user or create a new one if missing.
  async getOrCreateByClerkUserId(clerkUserId: string, db: Db = prisma): Promise<AppUser> {
    const existing = await db.appUser.findUnique({ where: { clerkUserId } })
    if (existing) return existing
    return db.appUser.create({ data: { clerkUserId } })
  },

  // Upsert all known fields by Clerk user id.
  async upsertByClerkUserId(
    input: {
      clerkUserId: string
      primaryEmail?: string | null
      firstName?: string | null
      lastName?: string | null
      displayName?: string | null
      phone?: string | null
      isDisabled?: boolean
      lastSignInAt?: Date | null
      lastSeenAt?: Date | null
    },
    db: Db = prisma
  ): Promise<AppUser> {
    return db.appUser.upsert({
      where: { clerkUserId: input.clerkUserId },
      create: {
        clerkUserId: input.clerkUserId,
        primaryEmail: input.primaryEmail ?? null,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        displayName: input.displayName ?? null,
        phone: input.phone ?? null,
        isDisabled: input.isDisabled ?? false,
        lastSignInAt: input.lastSignInAt ?? null,
        lastSeenAt: input.lastSeenAt ?? null,
      },
      update: {
        primaryEmail: input.primaryEmail ?? undefined,
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        displayName: input.displayName ?? undefined,
        phone: input.phone ?? undefined,
        isDisabled: input.isDisabled ?? undefined,
        lastSignInAt: input.lastSignInAt ?? undefined,
        lastSeenAt: input.lastSeenAt ?? undefined,
      },
    })
  },

  // Best-effort delete by Clerk user id (no-op if missing).
  async deleteByClerkUserId(clerkUserId: string, db: Db = prisma): Promise<void> {
    await db.appUser.deleteMany({ where: { clerkUserId } })
  },
}

