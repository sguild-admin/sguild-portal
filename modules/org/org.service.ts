// modules/org/org.service.ts
import "server-only"

import type { Organization } from "@prisma/client"
import { orgRepo, type UpsertOrgInput } from "@/modules/org/org.repo"

export const orgService = {
  async getById(id: string): Promise<Organization | null> {
    return orgRepo.getById(id)
  },

  async getByClerkOrgId(clerkOrgId: string): Promise<Organization | null> {
    return orgRepo.getByClerkOrgId(clerkOrgId)
  },

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

  async upsertFromClerk(input: { clerkOrgId: string; name: string }): Promise<Organization> {
    const data: UpsertOrgInput = { clerkOrgId: input.clerkOrgId, name: input.name }
    const org = await orgRepo.upsertByClerkOrgId(data)
    await orgRepo.ensureSettings(org.id)
    return org
  },

  async setPrimaryAdmin(orgId: string, clerkUserId: string | null) {
    return orgRepo.setPrimaryAdmin(orgId, clerkUserId)
  },

  async deleteByClerkOrgId(clerkOrgId: string): Promise<void> {
    await orgRepo.deleteByClerkOrgId(clerkOrgId)
  },
}
