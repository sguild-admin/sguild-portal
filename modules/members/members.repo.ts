// modules/members/members.repo.ts
import "server-only"

import { prisma } from "@/lib/prisma"
import type { OrgMembership, Prisma } from "../../prisma/generated/client"
import { MembershipStatus, OrgRole } from "../../prisma/generated/client"

type Db = Prisma.TransactionClient | typeof prisma

export type UpsertMembershipInput = {
  orgId: string
  clerkUserId: string
  role: OrgRole
  status: MembershipStatus
  invitedAt?: Date | null
  activatedAt?: Date | null
  disabledAt?: Date | null
}

export const membersRepo = {
  async getById(id: string, db: Db = prisma): Promise<OrgMembership | null> {
    return db.orgMembership.findUnique({ where: { id } })
  },

  async getByOrgAndClerkUserId(
    orgId: string,
    clerkUserId: string,
    db: Db = prisma
  ): Promise<OrgMembership | null> {
    return db.orgMembership.findUnique({
      where: {
        orgId_clerkUserId: { orgId, clerkUserId },
      },
    })
  },

  async listByOrg(
    orgId: string,
    input?: {
      role?: OrgRole
      status?: MembershipStatus
      take?: number
      skip?: number
      orderBy?: Prisma.OrgMembershipOrderByWithRelationInput
    },
    db: Db = prisma
  ): Promise<OrgMembership[]> {
    return db.orgMembership.findMany({
      where: {
        orgId,
        ...(input?.role ? { role: input.role } : {}),
        ...(input?.status ? { status: input.status } : {}),
      },
      take: input?.take ?? 100,
      skip: input?.skip ?? 0,
      orderBy: input?.orderBy ?? { createdAt: "asc" },
    })
  },

  async upsertMembership(
    data: UpsertMembershipInput,
    db: Db = prisma
  ): Promise<OrgMembership> {
    return db.orgMembership.upsert({
      where: {
        orgId_clerkUserId: { orgId: data.orgId, clerkUserId: data.clerkUserId },
      },
      create: {
        orgId: data.orgId,
        clerkUserId: data.clerkUserId,
        role: data.role,
        status: data.status,
        invitedAt: data.invitedAt ?? null,
        activatedAt: data.activatedAt ?? null,
        disabledAt: data.disabledAt ?? null,
      },
      update: {
        role: data.role,
        status: data.status,
        invitedAt: data.invitedAt ?? undefined,
        activatedAt: data.activatedAt ?? undefined,
        disabledAt: data.disabledAt ?? undefined,
      },
    })
  },

  async setRole(
    orgId: string,
    clerkUserId: string,
    role: OrgRole,
    db: Db = prisma
  ): Promise<OrgMembership> {
    return db.orgMembership.update({
      where: { orgId_clerkUserId: { orgId, clerkUserId } },
      data: { role },
    })
  },

  async setStatus(
    orgId: string,
    clerkUserId: string,
    status: MembershipStatus,
    timestamps?: {
      invitedAt?: Date | null
      activatedAt?: Date | null
      disabledAt?: Date | null
    },
    db: Db = prisma
  ): Promise<OrgMembership> {
    return db.orgMembership.update({
      where: { orgId_clerkUserId: { orgId, clerkUserId } },
      data: {
        status,
        ...(timestamps?.invitedAt !== undefined ? { invitedAt: timestamps.invitedAt } : {}),
        ...(timestamps?.activatedAt !== undefined ? { activatedAt: timestamps.activatedAt } : {}),
        ...(timestamps?.disabledAt !== undefined ? { disabledAt: timestamps.disabledAt } : {}),
      },
    })
  },

  async deleteMembership(
    orgId: string,
    clerkUserId: string,
    db: Db = prisma
  ): Promise<OrgMembership> {
    return db.orgMembership.delete({
      where: { orgId_clerkUserId: { orgId, clerkUserId } },
    })
  },
}
