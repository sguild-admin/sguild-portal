// modules/users/users.repo.ts
import "server-only"

import { prisma } from "@/lib/prisma"
import type { AppUser, Prisma } from "@prisma/client"

type Db = Prisma.TransactionClient | typeof prisma

export const usersRepo = {
  async getById(id: string, db: Db = prisma): Promise<AppUser | null> {
    return db.appUser.findUnique({ where: { id } })
  },

  async getByClerkUserId(clerkUserId: string, db: Db = prisma): Promise<AppUser | null> {
    return db.appUser.findUnique({ where: { clerkUserId } })
  },

  async create(clerkUserId: string, db: Db = prisma): Promise<AppUser> {
    return db.appUser.create({ data: { clerkUserId } })
  },

  async getOrCreateByClerkUserId(clerkUserId: string, db: Db = prisma): Promise<AppUser> {
    const existing = await db.appUser.findUnique({ where: { clerkUserId } })
    if (existing) return existing
    return db.appUser.create({ data: { clerkUserId } })
  },

  async upsertByClerkUserId(
    input: {
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
        avatarUrl: input.avatarUrl ?? null,
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
        avatarUrl: input.avatarUrl ?? undefined,
        isDisabled: input.isDisabled ?? undefined,
        lastSignInAt: input.lastSignInAt ?? undefined,
        lastSeenAt: input.lastSeenAt ?? undefined,
      },
    })
  },

  async deleteByClerkUserId(clerkUserId: string, db: Db = prisma): Promise<void> {
    await db.appUser.deleteMany({ where: { clerkUserId } })
  },
}

