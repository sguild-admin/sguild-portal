// modules/authz/authz.service.ts
import "server-only"

import { auth } from "@clerk/nextjs/server"
import type { AppUser, Organization, OrgMembership } from "@prisma/client"
import { MembershipStatus, OrgRole } from "@prisma/client"

import { orgService } from "@/modules/org/org.service"
import { membersService } from "@/modules/members/members.service"
import { HttpError } from "@/modules/_shared/errors"

type ClerkContext = {
  clerkUserId: string
  clerkOrgId: string | null
}

export { HttpError }

export type AuthzOrgAccess = {
  clerkUserId: string
  clerkOrgId: string
  org: Organization
  membership: OrgMembership
}

async function getClerkContext(): Promise<ClerkContext> {
  const a = await auth()

  if (!a.userId) {
    throw new HttpError(401, "UNAUTHENTICATED", "Not signed in")
  }

  return {
    clerkUserId: a.userId,
    clerkOrgId: a.orgId ?? null,
  }
}

function assertActiveMembership(m: OrgMembership | null): asserts m is OrgMembership {
  if (!m) {
    throw new HttpError(403, "NO_MEMBERSHIP", "No membership for this organization")
  }
  if (m.status !== MembershipStatus.ACTIVE) {
    throw new HttpError(403, "MEMBERSHIP_NOT_ACTIVE", "Membership is not active", {
      status: m.status,
    })
  }
}

function assertRole(m: OrgMembership, roles: OrgRole[]) {
  if (!roles.includes(m.role)) {
    throw new HttpError(403, "INSUFFICIENT_ROLE", "Insufficient role", {
      required: roles,
      actual: m.role,
    })
  }
}

export const authzService = {
  async getContext(): Promise<ClerkContext> {
    return getClerkContext()
  },

  // NEW: signed-in only, no org required
  async requireUserId(): Promise<{ clerkUserId: string }> {
    const ctx = await getClerkContext()
    return { clerkUserId: ctx.clerkUserId }
  },

  async requireOrgId(): Promise<{ clerkUserId: string; clerkOrgId: string }> {
    const ctx = await getClerkContext()
    if (!ctx.clerkOrgId) {
      throw new HttpError(400, "NO_ACTIVE_ORG", "No active organization selected")
    }
    return { clerkUserId: ctx.clerkUserId, clerkOrgId: ctx.clerkOrgId }
  },

  async requireOrgAccess(input?: { roles?: OrgRole[] }): Promise<AuthzOrgAccess> {
    const { clerkUserId, clerkOrgId } = await this.requireOrgId()

    const roles = input?.roles

    const org = await orgService.getOrCreateByClerkOrgId(clerkOrgId)

    const membership = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
    assertActiveMembership(membership)
    if (roles?.length) assertRole(membership, roles)

    return { clerkUserId, clerkOrgId, org, membership }
  },

  async requireAdmin(): Promise<AuthzOrgAccess> {
    return this.requireOrgAccess({ roles: [OrgRole.ADMIN] })
  },

  async requireCoachOrAdmin(): Promise<AuthzOrgAccess> {
    return this.requireOrgAccess({ roles: [OrgRole.COACH, OrgRole.ADMIN] })
  },
}
