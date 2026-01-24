// modules/org/org.dto.ts
// Data transfer objects for orgs (safe shape for API/UI).
import type { Organization } from "@prisma/client"

// Public-facing org representation.
export type OrgDTO = {
  id: string
  clerkOrgId: string
  name: string
  primaryAdminClerkUserId: string | null
  createdAt: Date
  updatedAt: Date
}

// Map a Prisma Organization to an OrgDTO.
export function toOrgDTO(o: Organization): OrgDTO {
  return {
    id: o.id,
    clerkOrgId: o.clerkOrgId,
    name: o.name,
    // Field might not exist in older Prisma types; keep a safe fallback.
    primaryAdminClerkUserId: (o as any).primaryAdminClerkUserId ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}
