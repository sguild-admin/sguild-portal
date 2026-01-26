// modules/org-settings/org-settings.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { orgSettingsRepo } from "./org-settings.repo"

type UpdateOrgSettingsInput = Partial<{
  timeZone: string
  currency: string
  acuityEnabled: boolean
  acuityUserId: string | null
  acuityApiKey: string | null
}>

export const orgSettingsService = {
  async get(headers: Headers) {
    await requireSession(headers)
    const orgId = await requireActiveOrgId(headers)
    return orgSettingsRepo.ensureDefaults(orgId)
  },

  async update(headers: Headers, input: UpdateOrgSettingsInput) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    return orgSettingsRepo.updateByOrgId(orgId, input)
  },

  async setAcuityApiKey(headers: Headers, apiKey: string | null) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)
    return orgSettingsRepo.updateByOrgId(orgId, { acuityApiKey: apiKey })
  },
}
