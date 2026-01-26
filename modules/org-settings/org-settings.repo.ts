import { prisma } from "@/lib/db/prisma"

export type OrgSettingsUpdate = Partial<{
  timeZone: string
  currency: string
  acuityEnabled: boolean
  acuityUserId: string | null
  acuityApiKey: string | null
}>

export const orgSettingsRepo = {
  getByOrgId(orgId: string) {
    return prisma.orgSettings.findUnique({
      where: { orgId },
    })
  },

  async ensureDefaults(orgId: string) {
    const existing = await prisma.orgSettings.findUnique({ where: { orgId } })
    if (existing) return existing

    return prisma.orgSettings.create({
      data: { orgId },
    })
  },

  updateByOrgId(orgId: string, data: OrgSettingsUpdate) {
    return prisma.orgSettings.update({
      where: { orgId },
      data,
    })
  },
}
