// modules/members/members.service.ts
import "server-only"

import type { OrgMembership } from "@prisma/client"
import { MembershipStatus, OrgRole } from "@prisma/client"
import { membersRepo, type UpsertMembershipInput } from "@/modules/members/members.repo"
import { usersService } from "@/modules/users/users.service"

export type ClerkMembershipSyncInput =
  | {
      action: "upsert"
      orgId: string
      clerkUserId: string
      clerkRole: string | null
      clerkStatus: string | null
      eventCreatedAt?: Date | null
    }
  | {
      action: "delete"
      orgId: string
      clerkUserId: string
      eventCreatedAt?: Date | null
    }

function mapClerkRoleToOrgRole(clerkRole: string | null): OrgRole {
  const r = (clerkRole ?? "").toLowerCase()
  if (r.includes("admin")) return OrgRole.ADMIN
  return OrgRole.COACH
}

function mapClerkStatusToMembershipStatus(clerkStatus: string | null): MembershipStatus {
  const s = (clerkStatus ?? "").toLowerCase()

  // Clerk commonly reports: "active", sometimes "pending"
  if (s === "active") return MembershipStatus.ACTIVE
  if (s === "pending" || s === "invited") return MembershipStatus.INVITED

  // Default conservative behavior: treat unknown as INVITED
  return MembershipStatus.INVITED
}

function computeTimestamps(
  next: MembershipStatus,
  existing: OrgMembership | null,
  now: Date
): Pick<UpsertMembershipInput, "invitedAt" | "activatedAt" | "disabledAt"> {
  if (next === MembershipStatus.INVITED) {
    return {
      invitedAt: existing?.invitedAt ?? now,
      activatedAt: null,
      disabledAt: null,
    }
  }

  if (next === MembershipStatus.ACTIVE) {
    return {
      invitedAt: existing?.invitedAt ?? null,
      activatedAt: existing?.activatedAt ?? now,
      disabledAt: null,
    }
  }

  return {
    invitedAt: existing?.invitedAt ?? null,
    activatedAt: existing?.activatedAt ?? null,
    disabledAt: existing?.disabledAt ?? now,
  }
}

export const membersService = {
  async getByOrgAndClerkUserId(orgId: string, clerkUserId: string) {
    return membersRepo.getByOrgAndClerkUserId(orgId, clerkUserId)
  },

  async listByOrg(
    orgId: string,
    input?: { role?: OrgRole; status?: MembershipStatus; take?: number; skip?: number }
  ) {
    return membersRepo.listByOrg(
      orgId,
      {
        role: input?.role,
        status: input?.status,
        take: input?.take,
        skip: input?.skip,
        orderBy: { createdAt: "asc" },
      },
      undefined
    )
  },

  async setRole(orgId: string, clerkUserId: string, role: OrgRole) {
    return membersRepo.setRole(orgId, clerkUserId, role)
  },

  async setStatus(
    orgId: string,
    clerkUserId: string,
    status: MembershipStatus,
    timestamps?: { invitedAt?: Date | null; activatedAt?: Date | null; disabledAt?: Date | null }
  ) {
    return membersRepo.setStatus(orgId, clerkUserId, status, timestamps)
  },

  async upsert(input: UpsertMembershipInput) {
    await usersService.getOrCreateByClerkUserId(input.clerkUserId)
    return membersRepo.upsertMembership(input)
  },

  async disable(orgId: string, clerkUserId: string, disabledAt?: Date) {
    const now = disabledAt ?? new Date()
    const existing = await membersRepo.getByOrgAndClerkUserId(orgId, clerkUserId)
    const ts = computeTimestamps(MembershipStatus.DISABLED, existing, now)

    // If it does not exist, create a disabled record with COACH role as a safe default
    const role = existing?.role ?? OrgRole.COACH

    await usersService.getOrCreateByClerkUserId(clerkUserId)

    return membersRepo.upsertMembership({
      orgId,
      clerkUserId,
      role,
      status: MembershipStatus.DISABLED,
      invitedAt: ts.invitedAt,
      activatedAt: ts.activatedAt,
      disabledAt: ts.disabledAt,
    })
  },

  async syncFromClerkMembership(input: ClerkMembershipSyncInput): Promise<OrgMembership | null> {
    const now = input.eventCreatedAt ?? new Date()

    if (input.action === "delete") {
      const existing = await membersRepo.getByOrgAndClerkUserId(input.orgId, input.clerkUserId)
      if (!existing) return null
      await membersRepo.deleteMembership(input.orgId, input.clerkUserId)
      return existing
    }

    await usersService.getOrCreateByClerkUserId(input.clerkUserId)

    const existing = await membersRepo.getByOrgAndClerkUserId(input.orgId, input.clerkUserId)

    const role = mapClerkRoleToOrgRole(input.clerkRole)
    const status = mapClerkStatusToMembershipStatus(input.clerkStatus)
    const ts = computeTimestamps(status, existing, now)

    return membersRepo.upsertMembership({
      orgId: input.orgId,
      clerkUserId: input.clerkUserId,
      role,
      status,
      invitedAt: ts.invitedAt,
      activatedAt: ts.activatedAt,
      disabledAt: ts.disabledAt,
    })
  },
}
