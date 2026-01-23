// modules/org/org.actions.ts
import "server-only"

import { authzService } from "@/modules/authz/authz.service"
import { orgService } from "@/modules/org/org.service"
import { SetPrimaryAdminBodySchema } from "./org.schema"
import { toOrgDTO } from "./org.dto"

export async function getMyOrgAction() {
  const access = await authzService.requireOrgAccess()

  return {
    org: toOrgDTO(access.org),
    membership: access.membership,
  }
}

export async function setPrimaryAdminAction(body: unknown) {
  const { org } = await authzService.requireAdmin()

  const data = SetPrimaryAdminBodySchema.parse(body)
  const updated = await orgService.setPrimaryAdmin(org.id, data.clerkUserId)

  return { org: toOrgDTO(updated) }
}
