// modules/authz/authz.service.ts
// Centralized authorization helpers for Clerk-authenticated requests.
import "server-only"

import { auth, clerkClient } from "@clerk/nextjs/server"
import type { Organization, OrgMembership } from "@prisma/client"
import { MembershipStatus, OrgRole } from "@prisma/client"

import { orgService } from "@/modules/org/org.service"
import { membersService } from "@/modules/members/members.service"
import { usersService } from "@/modules/users/users.service"
import { HttpError } from "@/modules/_shared/errors"

// Minimal Clerk auth context we rely on.
type ClerkContext = {
  clerkUserId: string
  clerkOrgId: string | null
}

export { HttpError }

// Context returned after org access checks succeed.
export type AuthzOrgAccess = {
  clerkUserId: string
  clerkOrgId: string
  org: Organization
  membership: OrgMembership
}

// Resolve the current Clerk user/org, or throw if not signed in.
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

// Ensure membership exists and is active.
function assertActiveMembership(m: OrgMembership | null): asserts m is OrgMembership {
  if (!m) {
    throw new HttpError(403, "NO_MEMBERSHIP", "No membership for this organization")
  }
  if (m.status !== MembershipStatus.ACTIVE) {
    throw new HttpError(403, "MEMBERSHIP_DISABLED", "Membership is disabled", {
      status: m.status,
    })
  }
}

// Ensure membership role is one of the allowed roles.
function assertRole(m: OrgMembership, roles: OrgRole[]) {
  if (!roles.includes(m.role)) {
    throw new HttpError(403, "FORBIDDEN", "Insufficient role", {
      required: roles,
      actual: m.role,
    })
  }
}

// Service used by actions to enforce authz in one place.
export const authzService = {
  async getContext(): Promise<ClerkContext> {
    return getClerkContext()
  },

  // Signed-in only, no org required.
  async requireUserId(): Promise<{ clerkUserId: string }> {
    const ctx = await getClerkContext()
    return { clerkUserId: ctx.clerkUserId }
  },

  // Signed-in and has active org selected.
  async requireOrgId(): Promise<{ clerkUserId: string; clerkOrgId: string }> {
    const ctx = await getClerkContext()
    if (!ctx.clerkOrgId) {
      throw new HttpError(400, "NO_ACTIVE_ORG", "No active organization selected")
    }
    return { clerkUserId: ctx.clerkUserId, clerkOrgId: ctx.clerkOrgId }
  },

  // Signed-in, org provisioned, membership active, optional role check.
  async requireOrgAccess(input?: { roles?: OrgRole[] }): Promise<AuthzOrgAccess> {
    const { clerkUserId, clerkOrgId } = await this.requireOrgId()

    const roles = input?.roles

    const org = await orgService.getByClerkOrgId(clerkOrgId)
    if (!org) {
      throw new HttpError(404, "ORG_NOT_PROVISIONED", "Organization not provisioned")
    }

    let membership = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
    if (!membership) {
      try {
        const client = await clerkClient()
        const memberships = await client.users.getOrganizationMembershipList({
          userId: clerkUserId,
          limit: 100,
        })
        const match = memberships.data.find(m => m.organization?.id === clerkOrgId)
        if (match) {
          await membersService.syncFromClerkMembership({
            action: "upsert",
            orgId: org.id,
            clerkUserId,
            clerkRole: typeof match.role === "string" ? match.role : null,
            clerkStatus: null,
          })
          membership = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
        }
      } catch {
        // ignore and fall through to standard checks
      }
    }
    assertActiveMembership(membership)

    const appUser = await usersService.getByClerkUserId(clerkUserId)
    if (appUser?.isDisabled) {
      throw new HttpError(403, "USER_DISABLED", "User is disabled")
    }

    if (roles?.length) assertRole(membership, roles)

    return { clerkUserId, clerkOrgId, org, membership }
  },

  // Convenience wrapper for admin-only access.
  async requireAdmin(): Promise<AuthzOrgAccess> {
    return this.requireOrgAccess({ roles: [OrgRole.ADMIN] })
  },

  // Convenience wrapper for coach or admin access.
  async requireCoachOrAdmin(): Promise<AuthzOrgAccess> {
    return this.requireOrgAccess({ roles: [OrgRole.COACH, OrgRole.ADMIN] })
  },
}
