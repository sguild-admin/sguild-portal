// modules/org/org.actions.ts
// Server actions for org-related use cases (authz + validation + DTO mapping).
import "server-only"

import { authzService } from "@/modules/authz/authz.service"
import { orgService } from "@/modules/org/org.service"
import { SetPrimaryAdminBodySchema } from "./org.schema"
import { toOrgDTO } from "./org.dto"

// Return the current org and membership for the signed-in user.
export async function getMyOrgAction() {
  const access = await authzService.requireOrgAccess()

  return {
    org: toOrgDTO(access.org),
    membership: access.membership,
  }
}

// Update the primary admin for the active org.
export async function setPrimaryAdminAction(body: unknown) {
  const { org } = await authzService.requireAdmin()

  const data = SetPrimaryAdminBodySchema.parse(body)
  const updated = await orgService.setPrimaryAdmin(org.id, data.clerkUserId)

  return { org: toOrgDTO(updated) }
}
