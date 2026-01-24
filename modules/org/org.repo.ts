// modules/org/org.repo.ts
// Prisma-only data access for organizations.
import "server-only"

import { prisma } from "@/lib/prisma"
import type { Organization, Prisma } from "@prisma/client"

// Shared DB type so callers can pass a transaction or the root Prisma client.
type Db = Prisma.TransactionClient | typeof prisma

// Minimal input required to create or update an organization.
export type UpsertOrgInput = {
  clerkOrgId: string
  name: string
  primaryAdminClerkUserId?: string | null
}

// Repository = Prisma-only data access for organizations.
// Keep business rules and auth checks out of this file.
export const orgRepo = {
  /** Look up an org by internal id. */
  async getById(id: string, db: Db = prisma): Promise<Organization | null> {
    return db.organization.findUnique({ where: { id } })
  },

  /** Look up an org by Clerk org id. */
  async getByClerkOrgId(clerkOrgId: string, db: Db = prisma): Promise<Organization | null> {
    return db.organization.findUnique({ where: { clerkOrgId } })
  },

  /**
   * Create or update an org by Clerk org id.
   * If `primaryAdminClerkUserId` is `undefined`, we leave the current value as-is.
   */
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

  /**
   * Ensure the org has a settings row.
   * Some test or migration contexts may not have the delegate available.
   */
  async ensureSettings(orgId: string, db: Db = prisma): Promise<
    Prisma.OrgSettingsGetPayload<Record<string, never>> | null
  > {
    const delegate = (db as typeof prisma & { orgSettings?: typeof prisma.orgSettings }).orgSettings
    if (!delegate) return null
    return delegate.upsert({
      where: { orgId },
      create: { orgId },
      update: {},
    })
  },

  /** Set or clear the org's primary admin Clerk user id. */
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

  /** Best-effort delete by Clerk org id (no-op if missing). */
  async deleteByClerkOrgId(clerkOrgId: string, db: Db = prisma): Promise<void> {
    await db.organization.deleteMany({ where: { clerkOrgId } })
  },
}
