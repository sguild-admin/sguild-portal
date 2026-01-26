"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { orgSettingsRepo } from "./org-settings.repo"
import { UpdateOrgSettingsSchema } from "./org-settings.schema"
import { toOrgSettingsDto } from "./org-settings.dto"

export async function getOrgSettingsAction() {
  const hdrs = await headers()
  await requireSession(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const settings = await orgSettingsRepo.ensureDefaults(orgId)
  return toOrgSettingsDto(settings)
}

export async function updateOrgSettingsAction(input: unknown) {
  const hdrs = await headers()
  await requireAdminOrOwner(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const data = UpdateOrgSettingsSchema.parse(input)
  const updated = await orgSettingsRepo.updateByOrgId(orgId, data)
  return toOrgSettingsDto(updated)
}

export async function setAcuityApiKeyAction(apiKey: string | null) {
  const hdrs = await headers()
  await requireAdminOrOwner(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const updated = await orgSettingsRepo.updateByOrgId(orgId, { acuityApiKey: apiKey })
  return toOrgSettingsDto(updated)
}
