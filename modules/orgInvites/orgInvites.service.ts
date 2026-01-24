// modules/orgInvites/orgInvites.service.ts
// Domain logic for org invitation records.
import "server-only"

import { OrgInviteStatus } from "@prisma/client"
import { orgInvitesRepo } from "@/modules/orgInvites/orgInvites.repo"

// Normalized input for Clerk invitation webhooks.
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

// Input used to match a membership event to an invite.
export type MembershipInviteMatchInput = {
  orgId: string
  acceptedAt: Date
  email?: string | null
  metadata?: Record<string, unknown> | null
}

// Partial update payload for invites.
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

// Map raw Clerk status to app OrgInviteStatus.
function mapStatus(rawStatus?: string | null): OrgInviteStatus {
  const s = (rawStatus ?? "").toLowerCase()
  if (s.includes("accepted")) return OrgInviteStatus.ACCEPTED
  if (s.includes("revoked")) return OrgInviteStatus.REVOKED
  if (s.includes("expired")) return OrgInviteStatus.EXPIRED
  return OrgInviteStatus.PENDING
}

// Normalize emails for consistent lookup.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// Service layer for org invites (no auth/request reads).
export const orgInvitesService = {
  // List invites for a given org with optional filters.
  async listByOrg(orgId: string, input?: { status?: OrgInviteStatus; take?: number; skip?: number }) {
    return orgInvitesRepo.listByOrg(orgId, input)
  },

  // Lookup by internal id.
  async getById(id: string) {
    return orgInvitesRepo.getById(id)
  },

  // Lookup by Clerk invitation id.
  async getByClerkInvitationId(clerkInvitationId: string) {
    return orgInvitesRepo.getByClerkInvitationId(clerkInvitationId)
  },

  // Lookup by org + email.
  async getByOrgAndEmail(orgId: string, email: string) {
    return orgInvitesRepo.getByOrgAndEmail(orgId, normalizeEmail(email))
  },

  // Create an invite record from Clerk invitation data.
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

  // Update fields by internal id.
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

  // Upsert based on Clerk invitation id.
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

  // Mark invite accepted by matching membership event.
  async markAcceptedFromMembership(input: MembershipInviteMatchInput) {
    const metadata = input.metadata ?? {}
    const dbInviteId =
      typeof (metadata as any).dbInviteId === "string" ? (metadata as any).dbInviteId : null
    const clerkInvitationId =
      typeof (metadata as any).clerkInvitationId === "string"
        ? (metadata as any).clerkInvitationId
        : null

    if (dbInviteId) {
      return orgInvitesRepo.updateStatusById(dbInviteId, OrgInviteStatus.ACCEPTED, {
        acceptedAt: input.acceptedAt,
      })
    }

    if (clerkInvitationId) {
      return orgInvitesRepo.updateStatusByClerkInvitationId(
        clerkInvitationId,
        OrgInviteStatus.ACCEPTED,
        {
          acceptedAt: input.acceptedAt,
        }
      )
    }

    if (input.email) {
      return orgInvitesRepo.updateStatusByOrgAndEmail(
        input.orgId,
        input.email,
        OrgInviteStatus.ACCEPTED,
        {
          acceptedAt: input.acceptedAt,
        }
      )
    }
  },

  // Mark invite revoked by Clerk invitation id.
  async markRevokedByClerkInvitationId(clerkInvitationId: string, revokedAt: Date) {
    return orgInvitesRepo.updateStatusByClerkInvitationId(clerkInvitationId, OrgInviteStatus.REVOKED, {
      revokedAt,
    })
  },
}
