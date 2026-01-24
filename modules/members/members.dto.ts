// modules/members/members.dto.ts
// DTOs for org membership records.
import type { OrgMembership } from "@prisma/client"

// Public-facing member representation.
export type MemberDTO = {
  id: string
  orgId: string
  clerkUserId: string
  role: OrgMembership["role"]
  status: OrgMembership["status"]
  invitedAt: Date | null
  activatedAt: Date | null
  disabledAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Map Prisma OrgMembership to MemberDTO.
export function toMemberDTO(m: OrgMembership): MemberDTO {
  return {
    id: m.id,
    orgId: m.orgId,
    clerkUserId: m.clerkUserId,
    role: m.role,
    status: m.status,
    invitedAt: m.invitedAt ?? null,
    activatedAt: m.activatedAt ?? null,
    disabledAt: m.disabledAt ?? null,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}
