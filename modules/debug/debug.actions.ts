// modules/debug/debug.actions.ts
// Admin-only debug helpers for Clerk org resolution.
import "server-only"

import { clerkClient } from "@clerk/nextjs/server"
import { authzService, HttpError } from "@/modules/authz/authz.service"
import env from "@/lib/env"

export async function checkClerkOrgAction(clerkOrgId: string) {
  if (!clerkOrgId) {
    throw new HttpError(400, "INVALID_ORG_ID", "Organization id is required")
  }

  await authzService.requireAdmin()

  const client = await clerkClient()
  const org = await client.organizations.getOrganization({ organizationId: clerkOrgId })

  return {
    orgId: org.id,
    name: org.name ?? null,
    publishableKeyPrefix: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 12),
  }
}

export async function listClerkOrgInvitesAction(clerkOrgId: string) {
  if (!clerkOrgId) {
    throw new HttpError(400, "INVALID_ORG_ID", "Organization id is required")
  }

  await authzService.requireAdmin()

  const client = await clerkClient()
  const invites = await client.organizations.getOrganizationInvitationList({
    organizationId: clerkOrgId,
    limit: 1,
  })

  return {
    count: invites.data.length,
  }
}
