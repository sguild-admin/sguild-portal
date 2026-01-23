// modules/org/org.repo.ts
import "server-only"

import { prisma } from "@/lib/prisma"
import type { Organization, Prisma } from "@prisma/client"

type Db = Prisma.TransactionClient | typeof prisma

export type UpsertOrgInput = {
  clerkOrgId: string
  name: string
  primaryAdminClerkUserId?: string | null
}

export const orgRepo = {
  async getById(id: string, db: Db = prisma): Promise<Organization | null> {
    return db.organization.findUnique({ where: { id } })
  },

  async getByClerkOrgId(clerkOrgId: string, db: Db = prisma): Promise<Organization | null> {
    return db.organization.findUnique({ where: { clerkOrgId } })
  },

  async upsertByClerkOrgId(input: UpsertOrgInput, db: Db = prisma): Promise<Organization> {
    return db.organization.upsert({
      where: { clerkOrgId: input.clerkOrgId },
      create: {
        clerkOrgId: input.clerkOrgId,
        name: input.name,
        primaryAdminClerkUserId: input.primaryAdminClerkUserId ?? null,
      },
      update: {
        name: input.name,
        primaryAdminClerkUserId:
          input.primaryAdminClerkUserId === undefined ? undefined : input.primaryAdminClerkUserId,
      },
    })
  },

  async setPrimaryAdmin(
    orgId: string,
    clerkUserId: string | null,
    db: Db = prisma
  ): Promise<Organization> {
    return db.organization.update({
      where: { id: orgId },
      data: { primaryAdminClerkUserId: clerkUserId },
    })
  },
}
