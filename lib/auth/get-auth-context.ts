// lib/auth/get-auth-context.ts
import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "./auth"

export type AuthContext = {
  session: any
  user: any
  orgId: string | null
  member: any | null
  role: string[] | null
  organization: any | null
}

/**
 * Server-only
 * Single source of truth for: session, active org, member, role
 */
export const getAuthContext = cache(
  async (opts?: { includeOrganization?: boolean }): Promise<AuthContext | null> => {
    const h = await headers()

    const session = await auth.api.getSession({ headers: h })
    if (!session) return null

    // These require an active organization
    const [memberRes, roleRes] = await Promise.allSettled([
      auth.api.getActiveMember({ headers: h }),
      auth.api.getActiveMemberRole({ headers: h }),
    ])

    const member =
      memberRes.status === "fulfilled" ? memberRes.value ?? null : null

    const rawRole =
      roleRes.status === "fulfilled" ? (roleRes.value as any)?.role : null

    const role =
      rawRole == null
        ? null
        : Array.isArray(rawRole)
          ? rawRole
          : [rawRole]

    const orgId =
      (session as any)?.activeOrganizationId ??
      (member as any)?.organizationId ??
      (member as any)?.orgId ??
      null

    let organization: any | null = null
    if (opts?.includeOrganization && orgId) {
      // If you omit query, Better Auth will use active org
      organization = await auth.api.getFullOrganization({
        query: { organizationId: orgId },
        headers: h,
      })
    }

    return {
      session,
      user: (session as any).user,
      orgId,
      member,
      role,
      organization,
    }
  }
)
