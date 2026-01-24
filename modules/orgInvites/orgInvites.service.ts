import "server-only"

import { OrgInviteStatus } from "@prisma/client"
import { orgInvitesRepo } from "@/modules/orgInvites/orgInvites.repo"

export type ClerkInvitationInput = {
  orgId: string
  clerkInvitationId: string
  email: string
  role?: string | null
  rawStatus?: string | null
  expiresAt?: Date | null
  acceptedAt?: Date | null
  revokedAt?: Date | null
}

export type MembershipInviteMatchInput = {
  orgId: string
  acceptedAt: Date
  email?: string | null
  metadata?: Record<string, unknown> | null
}

type UpdateInviteInput = {
  orgId?: string
  clerkInvitationId?: string
  email?: string
  role?: string | null
  status?: OrgInviteStatus
  lastSentAt?: Date | null
  expiresAt?: Date | null
  acceptedAt?: Date | null
  revokedAt?: Date | null
}

function mapStatus(rawStatus?: string | null): OrgInviteStatus {
  const s = (rawStatus ?? "").toLowerCase()
  if (s.includes("accepted")) return OrgInviteStatus.ACCEPTED
  if (s.includes("revoked")) return OrgInviteStatus.REVOKED
  if (s.includes("expired")) return OrgInviteStatus.EXPIRED
  return OrgInviteStatus.PENDING
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const orgInvitesService = {
  async listByOrg(orgId: string, input?: { status?: OrgInviteStatus; take?: number; skip?: number }) {
    return orgInvitesRepo.listByOrg(orgId, input)
  },

  async getById(id: string) {
    return orgInvitesRepo.getById(id)
  },

  async getByClerkInvitationId(clerkInvitationId: string) {
    return orgInvitesRepo.getByClerkInvitationId(clerkInvitationId)
  },

  async getByOrgAndEmail(orgId: string, email: string) {
    return orgInvitesRepo.getByOrgAndEmail(orgId, normalizeEmail(email))
  },

  async createFromClerkInvitation(input: ClerkInvitationInput & { id: string; lastSentAt?: Date | null }) {
    const status = mapStatus(input.rawStatus)
    return orgInvitesRepo.create({
      id: input.id,
      orgId: input.orgId,
      clerkInvitationId: input.clerkInvitationId,
      email: normalizeEmail(input.email),
      role: input.role ?? null,
      status,
      lastSentAt: input.lastSentAt ?? new Date(),
      expiresAt: input.expiresAt ?? null,
      acceptedAt: status === OrgInviteStatus.ACCEPTED ? (input.acceptedAt ?? new Date()) : null,
      revokedAt: status === OrgInviteStatus.REVOKED ? (input.revokedAt ?? new Date()) : null,
    })
  },

  async updateById(id: string, input: UpdateInviteInput) {
    return orgInvitesRepo.updateById(id, {
      orgId: input.orgId,
      clerkInvitationId: input.clerkInvitationId,
      email: input.email ? normalizeEmail(input.email) : undefined,
      role: input.role ?? undefined,
      status: input.status,
      lastSentAt: input.lastSentAt,
      expiresAt: input.expiresAt,
      acceptedAt: input.acceptedAt,
      revokedAt: input.revokedAt,
    })
  },

  async upsertFromClerkInvitation(input: ClerkInvitationInput) {
    const status = mapStatus(input.rawStatus)
    return orgInvitesRepo.upsertByClerkInvitationId({
      orgId: input.orgId,
      clerkInvitationId: input.clerkInvitationId,
      email: normalizeEmail(input.email),
      role: input.role ?? null,
      status,
      lastSentAt: input.acceptedAt || input.revokedAt ? undefined : new Date(),
      expiresAt: input.expiresAt ?? null,
      acceptedAt: status === OrgInviteStatus.ACCEPTED ? (input.acceptedAt ?? new Date()) : null,
      revokedAt: status === OrgInviteStatus.REVOKED ? (input.revokedAt ?? new Date()) : null,
    })
  },

  async markAcceptedFromMembership(input: MembershipInviteMatchInput) {
    const metadata = input.metadata ?? {}
    const dbInviteId = typeof (metadata as any).dbInviteId === "string" ? (metadata as any).dbInviteId : null
    const clerkInvitationId =
      typeof (metadata as any).clerkInvitationId === "string" ? (metadata as any).clerkInvitationId : null

    if (dbInviteId) {
      return orgInvitesRepo.updateStatusById(dbInviteId, OrgInviteStatus.ACCEPTED, {
        acceptedAt: input.acceptedAt,
      })
    }

    if (clerkInvitationId) {
      return orgInvitesRepo.updateStatusByClerkInvitationId(clerkInvitationId, OrgInviteStatus.ACCEPTED, {
        acceptedAt: input.acceptedAt,
      })
    }

    if (input.email) {
      return orgInvitesRepo.updateStatusByOrgAndEmail(input.orgId, input.email, OrgInviteStatus.ACCEPTED, {
        acceptedAt: input.acceptedAt,
      })
    }
  },

  async markRevokedByClerkInvitationId(clerkInvitationId: string, revokedAt: Date) {
    return orgInvitesRepo.updateStatusByClerkInvitationId(clerkInvitationId, OrgInviteStatus.REVOKED, {
      revokedAt,
    })
  },
}
