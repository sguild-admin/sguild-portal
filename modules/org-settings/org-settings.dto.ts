import type { OrgSettings } from "@prisma/client"

export type OrgSettingsDto = {
  id: string
  orgId: string
  timeZone: string
  currency: string

  acuityEnabled: boolean
  acuityUserId: string | null

  // Do not expose actual key
  hasAcuityApiKey: boolean

  createdAt: Date
  updatedAt: Date
}

export function toOrgSettingsDto(s: OrgSettings): OrgSettingsDto {
  return {
    id: s.id,
    orgId: s.orgId,
    timeZone: s.timeZone,
    currency: s.currency,
    acuityEnabled: s.acuityEnabled,
    acuityUserId: s.acuityUserId,
    hasAcuityApiKey: Boolean(s.acuityApiKey),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}
