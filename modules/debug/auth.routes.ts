// modules/debug/auth.routes.ts
// Debug auth context endpoint.
import "server-only"

import { jsonErrorResponse } from "@/modules/_shared/errors"
import { clerkClient } from "@clerk/nextjs/server"
import { authzService } from "@/modules/authz/authz.service"
import env from "@/lib/env"

// GET /api/debug/auth-context
export const GET_authContext = async () => {
  try {
    const ctx = await authzService.getContext()
    let clerkRole: string | null = null

    if (ctx.clerkUserId) {
      try {
        const client = await clerkClient()
        const memberships = await client.users.getOrganizationMembershipList({
          userId: ctx.clerkUserId,
          limit: 100,
        })
        const match = memberships.data.find(m => m.organization?.id === ctx.clerkOrgId)
        clerkRole = typeof match?.role === "string" ? match.role : null
      } catch {
        clerkRole = null
      }
    }

    return Response.json({
      ok: true,
      clerkUserId: ctx.clerkUserId,
      clerkOrgId: ctx.clerkOrgId,
      clerkRole,
      publishableKeyPrefix: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 12),
    })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}
