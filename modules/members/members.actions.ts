// modules/members/members.actions.ts
// Server actions for listing and managing org memberships.
import "server-only"

import { MembershipStatus, OrgRole } from "@prisma/client"
import { authzService, HttpError } from "@/modules/authz/authz.service"
import { asEnum, asInt, getQuery } from "@/modules/_shared/http"
import { membersService } from "@/modules/members/members.service"
import { ListMembersQuerySchema, PatchMemberBodySchema } from "./members.schema"
import { toMemberWithUserDTO } from "./members.dto"

// List members for the active org (admin only).
export async function listMembersAction(request: Request) {
  const { org } = await authzService.requireAdmin()

  const query = getQuery(request)
  const role = asEnum(OrgRole, query.get("role"))
  const status = asEnum(MembershipStatus, query.get("status"))
  const take = Math.min(asInt(query.get("take"), 100), 200)
  const skip = Math.max(asInt(query.get("skip"), 0), 0)

  const input = ListMembersQuerySchema.parse({ role, status, take, skip })
  const members = await membersService.listByOrgWithUser(org.id, input)

  return { members: members.map(toMemberWithUserDTO) }
}

// Return membership and org info for current user.
export async function getMeAction() {
  await authzService.requireUserId()
  const access = await authzService.requireOrgAccess()
  return {
    org: { id: access.org.id, clerkOrgId: access.org.clerkOrgId, name: access.org.name },
    membership: access.membership,
  }
}

// Fetch a member by Clerk user id (admin only).
export async function getMemberByClerkUserIdAction(clerkUserId: string) {
  const { org } = await authzService.requireAdmin()

  const member = await membersService.getByOrgAndClerkUserIdWithUser(org.id, clerkUserId)
  if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found")

  return { member: toMemberWithUserDTO(member) }
}

// Patch a member's role/status (admin only).
export async function patchMemberByClerkUserIdAction(clerkUserId: string, body: unknown) {
  const { org } = await authzService.requireAdmin()

  const data = PatchMemberBodySchema.parse(body)

  let updated = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
  if (!updated) throw new HttpError(404, "NOT_FOUND", "Member not found")

  if (data.role) updated = await membersService.setRole(org.id, clerkUserId, data.role)

  if (data.status) {
    const now = new Date()
    const timestamps =
      data.status === MembershipStatus.ACTIVE
        ? { activatedAt: now, disabledAt: null }
        : { disabledAt: now }

    updated = await membersService.setStatus(org.id, clerkUserId, data.status, timestamps)
  }

  const refreshed = await membersService.getByOrgAndClerkUserIdWithUser(org.id, clerkUserId)
  if (!refreshed) throw new HttpError(404, "NOT_FOUND", "Member not found")
  return { member: toMemberWithUserDTO(refreshed) }
}
