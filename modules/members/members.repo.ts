// modules/members/members.repo.ts
// Prisma-only data access for org memberships.
import "server-only"

import { prisma } from "@/lib/prisma"
import type { OrgMembership, Prisma } from "@prisma/client"
import { MembershipStatus, OrgRole } from "@prisma/client"

// Allow passing a transaction client or the root Prisma client.
type Db = Prisma.TransactionClient | typeof prisma

// Minimal membership payload used for upsert.
export type UpsertMembershipInput = {
  orgId: string
  clerkUserId: string
  role: OrgRole
  status: MembershipStatus
  invitedAt?: Date | null
  activatedAt?: Date | null
  disabledAt?: Date | null
}

// Membership record including basic user and coach profile data.
export type MemberWithUser = Prisma.OrgMembershipGetPayload<{
  include: {
    appUser: {
      select: {
        id: true
        clerkUserId: true
        primaryEmail: true
        firstName: true
        lastName: true
        displayName: true
        coachProfile: {
          select: {
            bio: true
            notes: true
            zip: true
            phone: true
          }
        }
      }
    }
  }
}>

// Repo functions are pure data access (no auth or validation).
export const membersRepo = {
  // Lookup membership by internal id.
  async getById(id: string, db: Db = prisma): Promise<OrgMembership | null> {
    return db.orgMembership.findUnique({ where: { id } })
  },

  // Lookup membership by org + Clerk user id.
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

  // Lookup membership with related user and coach profile.
  async getByOrgAndClerkUserIdWithUser(
    orgId: string,
    clerkUserId: string,
    db: Db = prisma
  ): Promise<MemberWithUser | null> {
    return db.orgMembership.findUnique({
      where: {
        orgId_clerkUserId: { orgId, clerkUserId },
      },
      include: {
        appUser: {
          select: {
            id: true,
            clerkUserId: true,
            primaryEmail: true,
            firstName: true,
            lastName: true,
            displayName: true,
            coachProfile: {
              select: {
                bio: true,
                notes: true,
                zip: true,
                phone: true,
              },
            },
          },
        },
      },
    })
  },

  // List memberships for a given org with optional filters.
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

  // List memberships with related user and coach profile data.
  async listByOrgWithUser(
    orgId: string,
    input?: {
      role?: OrgRole
      status?: MembershipStatus
      take?: number
      skip?: number
      orderBy?: Prisma.OrgMembershipOrderByWithRelationInput
    },
    db: Db = prisma
  ): Promise<MemberWithUser[]> {
    return db.orgMembership.findMany({
      where: {
        orgId,
        ...(input?.role ? { role: input.role } : {}),
        ...(input?.status ? { status: input.status } : {}),
      },
      take: input?.take ?? 100,
      skip: input?.skip ?? 0,
      orderBy: input?.orderBy ?? { createdAt: "asc" },
      include: {
        appUser: {
          select: {
            id: true,
            clerkUserId: true,
            primaryEmail: true,
            firstName: true,
            lastName: true,
            displayName: true,
            coachProfile: {
              select: {
                bio: true,
                notes: true,
                zip: true,
                phone: true,
              },
            },
          },
        },
      },
    })
  },

  // Create or update a membership record.
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

  // Update a member's role.
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

  // Update a member's status and timestamps.
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

  // Delete a membership by org + Clerk user id.
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
