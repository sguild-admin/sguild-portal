// modules/members/members.service.ts
// Domain logic for org membership state and synchronization.
import "server-only"

import type { OrgMembership } from "@prisma/client"
import { MembershipStatus, OrgRole } from "@prisma/client"
import { membersRepo, type MemberWithUser, type UpsertMembershipInput } from "@/modules/members/members.repo"
import { usersService } from "@/modules/users/users.service"

// Input shape for syncing membership events from Clerk webhooks.
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

// Map Clerk role strings to app OrgRole enum.
function mapClerkRoleToOrgRole(clerkRole: string | null): OrgRole {
  const r = (clerkRole ?? "").toLowerCase()
  if (r.includes("admin")) return OrgRole.ADMIN
  return OrgRole.COACH
}

// Map Clerk status strings to app MembershipStatus.
function mapClerkStatusToMembershipStatus(clerkStatus: string | null): MembershipStatus {
  const s = (clerkStatus ?? "").toLowerCase()

  if (s === "disabled" || s === "deleted") return MembershipStatus.DISABLED

  // Treat pending/invited as ACTIVE since we no longer model INVITED
  return MembershipStatus.ACTIVE
}

// Derive timestamps based on next status and existing membership.
function computeTimestamps(
  next: MembershipStatus,
  existing: OrgMembership | null,
  now: Date
): Pick<UpsertMembershipInput, "invitedAt" | "activatedAt" | "disabledAt"> {
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

// Service layer for memberships (no Request/auth reads).
export const membersService = {
  // Lookup by org + Clerk user id.
  async getByOrgAndClerkUserId(orgId: string, clerkUserId: string) {
    return membersRepo.getByOrgAndClerkUserId(orgId, clerkUserId)
  },

  // Lookup by org + Clerk user id with related user data.
  async getByOrgAndClerkUserIdWithUser(
    orgId: string,
    clerkUserId: string
  ): Promise<MemberWithUser | null> {
    return membersRepo.getByOrgAndClerkUserIdWithUser(orgId, clerkUserId)
  },

  // List members by org with optional filters.
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

  // List members with related user data.
  async listByOrgWithUser(
    orgId: string,
    input?: { role?: OrgRole; status?: MembershipStatus; take?: number; skip?: number }
  ): Promise<MemberWithUser[]> {
    return membersRepo.listByOrgWithUser(orgId, {
      role: input?.role,
      status: input?.status,
      take: input?.take,
      skip: input?.skip,
      orderBy: { createdAt: "asc" },
    })
  },

  // Update member role.
  async setRole(orgId: string, clerkUserId: string, role: OrgRole) {
    return membersRepo.setRole(orgId, clerkUserId, role)
  },

  // Update member status and optional timestamps.
  async setStatus(
    orgId: string,
    clerkUserId: string,
    status: MembershipStatus,
    timestamps?: { invitedAt?: Date | null; activatedAt?: Date | null; disabledAt?: Date | null }
  ) {
    return membersRepo.setStatus(orgId, clerkUserId, status, timestamps)
  },

  // Upsert membership and ensure user exists.
  async upsert(input: UpsertMembershipInput) {
    await usersService.getOrCreateByClerkUserId(input.clerkUserId)
    return membersRepo.upsertMembership(input)
  },

  // Disable a member (creates record if missing).
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

  // Apply Clerk membership event to local state.
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
