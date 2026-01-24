// modules/org/org.service.ts
// Domain rules and transitions for organizations.
import "server-only"

import type { Organization } from "@prisma/client"
import { orgRepo, type UpsertOrgInput } from "@/modules/org/org.repo"

// Service layer orchestrating repo calls (no auth or request objects).
export const orgService = {
  // Lookup by internal id.
  async getById(id: string): Promise<Organization | null> {
    return orgRepo.getById(id)
  },

  // Lookup by Clerk org id.
  async getByClerkOrgId(clerkOrgId: string): Promise<Organization | null> {
    return orgRepo.getByClerkOrgId(clerkOrgId)
  },

  // Fetch or create a minimal org; ensures settings row exists.
  async getOrCreateByClerkOrgId(clerkOrgId: string): Promise<Organization> {
    const existing = await orgRepo.getByClerkOrgId(clerkOrgId)
    if (existing) {
      await orgRepo.ensureSettings(existing.id)
      return existing
    }

    // Minimal safe fallback. Webhooks will later update name.
    const created = await orgRepo.upsertByClerkOrgId({
      clerkOrgId,
      name: "New Organization",
    })
    await orgRepo.ensureSettings(created.id)
    return created
  },

  // Upsert from Clerk webhook data and ensure settings row exists.
  async upsertFromClerk(input: { clerkOrgId: string; name: string }): Promise<Organization> {
    const data: UpsertOrgInput = { clerkOrgId: input.clerkOrgId, name: input.name }
    const org = await orgRepo.upsertByClerkOrgId(data)
    await orgRepo.ensureSettings(org.id)
    return org
  },

  // Update or clear the primary admin for an org.
  async setPrimaryAdmin(orgId: string, clerkUserId: string | null) {
    return orgRepo.setPrimaryAdmin(orgId, clerkUserId)
  },

  // Delete org record(s) by Clerk org id.
  async deleteByClerkOrgId(clerkOrgId: string): Promise<void> {
    await orgRepo.deleteByClerkOrgId(clerkOrgId)
  },
}
