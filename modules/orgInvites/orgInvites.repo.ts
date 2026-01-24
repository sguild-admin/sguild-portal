// modules/orgInvites/orgInvites.repo.ts
// Prisma-only data access for org invitations.
import "server-only"

import { prisma } from "@/lib/prisma"
import { OrgInviteStatus } from "@prisma/client"
import type { OrgInvitation, Prisma } from "@prisma/client"

// Allow passing a transaction or the root Prisma client.
type Db = Prisma.TransactionClient | typeof prisma

// Input used for upserting org invitations.
export type UpsertOrgInviteInput = {
  orgId: string
  clerkInvitationId: string
  email: string
  role?: string | null
  status: OrgInviteStatus
  lastSentAt?: Date | null
  expiresAt?: Date | null
  acceptedAt?: Date | null
  revokedAt?: Date | null
}

// Input used for creating org invitations.
export type CreateOrgInviteInput = UpsertOrgInviteInput & {
  id: string
}

// Repository functions (no auth or validation).
export const orgInvitesRepo = {
  // Lookup by internal id.
  async getById(id: string, db: Db = prisma): Promise<OrgInvitation | null> {
    return db.orgInvitation.findUnique({ where: { id } })
  },

  // Lookup by Clerk invitation id.
  async getByClerkInvitationId(clerkInvitationId: string, db: Db = prisma) {
    return db.orgInvitation.findUnique({ where: { clerkInvitationId } })
  },

  // List invites for an org with optional status filter.
  async listByOrg(
    orgId: string,
    input?: { status?: OrgInviteStatus; take?: number; skip?: number },
    db: Db = prisma
  ): Promise<OrgInvitation[]> {
    return db.orgInvitation.findMany({
      where: {
        orgId,
        ...(input?.status ? { status: input.status } : {}),
      },
      take: input?.take ?? 100,
      skip: input?.skip ?? 0,
      orderBy: { createdAt: "desc" },
    })
  },

  // Lookup the most recent invite by org + email.
  async getByOrgAndEmail(orgId: string, email: string, db: Db = prisma) {
    return db.orgInvitation.findFirst({
      where: { orgId, email },
      orderBy: { createdAt: "desc" },
    })
  },

  // Create a new invite record.
  async create(data: CreateOrgInviteInput, db: Db = prisma): Promise<OrgInvitation> {
    return db.orgInvitation.create({
      data: {
        id: data.id,
        orgId: data.orgId,
        clerkInvitationId: data.clerkInvitationId,
        email: data.email,
        role: data.role ?? null,
        status: data.status,
        lastSentAt: data.lastSentAt ?? null,
        expiresAt: data.expiresAt ?? null,
        acceptedAt: data.acceptedAt ?? null,
        revokedAt: data.revokedAt ?? null,
      },
    })
  },

  // Update invite by internal id.
  async updateById(
    id: string,
    data: Partial<UpsertOrgInviteInput> & {
      clerkInvitationId?: string
    },
    db: Db = prisma
  ): Promise<OrgInvitation> {
    return db.orgInvitation.update({
      where: { id },
      data: {
        orgId: data.orgId,
        clerkInvitationId: data.clerkInvitationId,
        email: data.email,
        role: data.role ?? undefined,
        status: data.status,
        lastSentAt: data.lastSentAt ?? undefined,
        expiresAt: data.expiresAt ?? undefined,
        acceptedAt: data.acceptedAt ?? undefined,
        revokedAt: data.revokedAt ?? undefined,
      },
    })
  },

  // Upsert by Clerk invitation id.
  async upsertByClerkInvitationId(
    data: UpsertOrgInviteInput,
    db: Db = prisma
  ): Promise<OrgInvitation> {
    return db.orgInvitation.upsert({
      where: { clerkInvitationId: data.clerkInvitationId },
      create: {
        orgId: data.orgId,
        clerkInvitationId: data.clerkInvitationId,
        email: data.email,
        role: data.role ?? null,
        status: data.status,
        lastSentAt: data.lastSentAt ?? null,
        expiresAt: data.expiresAt ?? null,
        acceptedAt: data.acceptedAt ?? null,
        revokedAt: data.revokedAt ?? null,
      },
      update: {
        orgId: data.orgId,
        email: data.email,
        role: data.role ?? null,
        status: data.status,
        lastSentAt: data.lastSentAt ?? undefined,
        expiresAt: data.expiresAt ?? undefined,
        acceptedAt: data.acceptedAt ?? undefined,
        revokedAt: data.revokedAt ?? undefined,
      },
    })
  },

  // Update status by internal id.
  async updateStatusById(
    id: string,
    status: OrgInviteStatus,
    timestamps: { acceptedAt?: Date | null; revokedAt?: Date | null }
  ) {
    return prisma.orgInvitation.update({
      where: { id },
      data: { status, ...timestamps },
    })
  },

  // Update status by Clerk invitation id.
  async updateStatusByClerkInvitationId(
    clerkInvitationId: string,
    status: OrgInviteStatus,
    timestamps: { acceptedAt?: Date | null; revokedAt?: Date | null }
  ) {
    return prisma.orgInvitation.update({
      where: { clerkInvitationId },
      data: { status, ...timestamps },
    })
  },

  // Update status by org + email (pending invites only).
  async updateStatusByOrgAndEmail(
    orgId: string,
    email: string,
    status: OrgInviteStatus,
    timestamps: { acceptedAt?: Date | null; revokedAt?: Date | null }
  ) {
    return prisma.orgInvitation.updateMany({
      where: { orgId, email, status: OrgInviteStatus.PENDING },
      data: { status, ...timestamps },
    })
  },
}
