// modules/org/org.dto.ts
import type { Organization } from "@prisma/client"

export type OrgDTO = {
  id: string
  clerkOrgId: string
  name: string
  primaryAdminClerkUserId: string | null
  createdAt: Date
  updatedAt: Date
}

export function toOrgDTO(o: Organization): OrgDTO {
  return {
    id: o.id,
    clerkOrgId: o.clerkOrgId,
    name: o.name,
    primaryAdminClerkUserId: (o as any).primaryAdminClerkUserId ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}
