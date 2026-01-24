import "server-only"

import { prisma } from "@/lib/prisma"
import { OrgInviteStatus } from "@prisma/client"
import type { OrgInvitation, Prisma } from "@prisma/client"

type Db = Prisma.TransactionClient | typeof prisma

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

export type CreateOrgInviteInput = UpsertOrgInviteInput & {
  id: string
}

export const orgInvitesRepo = {
  async getById(id: string, db: Db = prisma): Promise<OrgInvitation | null> {
    return db.orgInvitation.findUnique({ where: { id } })
  },

  async getByClerkInvitationId(clerkInvitationId: string, db: Db = prisma) {
    return db.orgInvitation.findUnique({ where: { clerkInvitationId } })
  },

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

  async getByOrgAndEmail(orgId: string, email: string, db: Db = prisma) {
    return db.orgInvitation.findFirst({
      where: { orgId, email },
      orderBy: { createdAt: "desc" },
    })
  },

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

  async deleteByEmail(email: string, db: Db = prisma): Promise<void> {
    await db.orgInvitation.deleteMany({ where: { email } })
  },

  async deleteByClerkInvitationIds(ids: string[], db: Db = prisma): Promise<void> {
    if (!ids.length) return
    await db.orgInvitation.deleteMany({ where: { clerkInvitationId: { in: ids } } })
  },
}
