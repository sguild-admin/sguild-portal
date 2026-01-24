// modules/orgInvites/orgInvites.dto.ts
// DTOs for org invitation records.
import type { OrgInvitation, OrgInviteStatus } from "@prisma/client"

// Public-facing invite representation.
export type OrgInviteDTO = {
  id: string
  orgId: string
  clerkInvitationId: string
  email: string
  role: string | null
  status: OrgInviteStatus
  lastSentAt: Date | null
  expiresAt: Date | null
  acceptedAt: Date | null
  revokedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Map Prisma OrgInvitation to OrgInviteDTO.
export function toOrgInviteDTO(invite: OrgInvitation): OrgInviteDTO {
  return {
    id: invite.id,
    orgId: invite.orgId,
    clerkInvitationId: invite.clerkInvitationId,
    email: invite.email,
    role: invite.role ?? null,
    status: invite.status,
    lastSentAt: invite.lastSentAt ?? null,
    expiresAt: invite.expiresAt ?? null,
    acceptedAt: invite.acceptedAt ?? null,
    revokedAt: invite.revokedAt ?? null,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,
  }
}
