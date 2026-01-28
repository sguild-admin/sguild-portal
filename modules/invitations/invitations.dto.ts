export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"

export type InvitationDto = {
  id: string
  organizationId: string
  email: string
  role: string
  createdAt: string
  expiresAt: string
  lastSentAt: string | null
  acceptedAt: string | null
  revokedAt: string | null
  status: InvitationStatus
  tokenLast4: string | null
}

export type InvitationWithUrlDto = {
  invite: InvitationDto
  inviteUrl: string
}

export function computeInvitationStatus(inv: {
  acceptedAt: Date | null
  revokedAt: Date | null
  expiresAt: Date
}): InvitationStatus {
  if (inv.acceptedAt) return "ACCEPTED"
  if (inv.revokedAt) return "REVOKED"
  if (inv.expiresAt.getTime() <= Date.now()) return "EXPIRED"
  return "PENDING"
}

export function toInvitationDto(inv: {
  id: string
  organizationId: string
  email: string
  role: string
  createdAt: Date
  expiresAt: Date
  lastSentAt: Date | null
  acceptedAt: Date | null
  revokedAt: Date | null
  tokenLast4: string | null
}): InvitationDto {
  return {
    id: inv.id,
    organizationId: inv.organizationId,
    email: inv.email,
    role: inv.role,
    createdAt: inv.createdAt.toISOString(),
    expiresAt: inv.expiresAt.toISOString(),
    lastSentAt: inv.lastSentAt ? inv.lastSentAt.toISOString() : null,
    acceptedAt: inv.acceptedAt ? inv.acceptedAt.toISOString() : null,
    revokedAt: inv.revokedAt ? inv.revokedAt.toISOString() : null,
    status: computeInvitationStatus({
      acceptedAt: inv.acceptedAt,
      revokedAt: inv.revokedAt,
      expiresAt: inv.expiresAt,
    }),
    tokenLast4: inv.tokenLast4 ?? null,
  }
}
