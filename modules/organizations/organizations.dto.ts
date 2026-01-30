import type { Organization, Prisma } from "@prisma/client"

export type OrganizationDto = {
  id: string
  name: string
  slug: string
  logo: string | null
  metadata: Prisma.JsonValue | null
  createdAt: Date
  updatedAt: Date
}

export function toOrganizationDto(org: Organization): OrganizationDto {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo,
    metadata: org.metadata,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  }
}

export type OrganizationWithSettingsDto = OrganizationDto & {
  settings?: {
    timeZone: string
    currency: string
    offersOceanLessons: boolean
    acuityEnabled: boolean
    acuityUserId: string | null
    hasAcuityApiKey: boolean
  } | null
}
