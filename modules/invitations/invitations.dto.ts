import type { Invitation } from "@prisma/client"

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired"

export type InvitationDto = {
  id: string
  organizationId: string
  email: string
  role: string | null
  status: string
  expiresAt: Date
  createdAt: Date
  inviterId: string
}

export function toInvitationDto(i: Invitation): InvitationDto {
  return {
    id: i.id,
    organizationId: i.organizationId,
    email: i.email,
    role: i.role ?? null,
    status: i.status,
    expiresAt: i.expiresAt,
    createdAt: i.createdAt,
    inviterId: i.inviterId,
  }
}
