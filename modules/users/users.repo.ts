// modules/users/users.repo.ts
import "server-only"

import { prisma } from "@/lib/prisma"
import type { AppUser, Prisma } from "../../prisma/generated/client"

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

  async setSuperAdmin(
    clerkUserId: string,
    isSuperAdmin: boolean,
    db: Db = prisma
  ): Promise<AppUser> {
    return db.appUser.upsert({
      where: { clerkUserId },
      create: { clerkUserId, isSuperAdmin },
      update: { isSuperAdmin },
    })
  },
}
