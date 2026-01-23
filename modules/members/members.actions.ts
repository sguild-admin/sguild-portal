// modules/members/members.actions.ts
import "server-only"

import { MembershipStatus, OrgRole } from "../../prisma/generated/client"
import { authzService, HttpError } from "@/modules/authz/authz.service"
import { membersService } from "@/modules/members/members.service"
import { usersService } from "@/modules/users/users.service"
import { ListMembersQuerySchema, PatchMemberBodySchema } from "./members.schema"
import { toMemberDTO } from "./members.dto"

function parseIntParam(v: string | null, fallback: number) {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

function parseEnum<T extends Record<string, string>>(e: T, v: string | null): T[keyof T] | undefined {
  if (!v) return undefined
  const values = Object.values(e)
  return values.includes(v) ? (v as T[keyof T]) : undefined
}

export async function listMembersAction(request: Request) {
  const { org } = await authzService.requireAdmin()

  const url = new URL(request.url)
  const role = parseEnum(OrgRole, url.searchParams.get("role"))
  const status = parseEnum(MembershipStatus, url.searchParams.get("status"))
  const take = Math.min(parseIntParam(url.searchParams.get("take"), 100), 200)
  const skip = Math.max(parseIntParam(url.searchParams.get("skip"), 0), 0)

  const query = ListMembersQuerySchema.parse({ role, status, take, skip })
  const members = await membersService.listByOrg(org.id, query)

  return { members: members.map(toMemberDTO) }
}

export async function getMeAction() {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)

  if (user.isSuperAdmin) {
    return {
      org: null,
      mode: "superadmin" as const,
      membership: null,
    }
  }

  const access = await authzService.requireOrgAccess({ allowSuperAdmin: false })
  return {
    org: { id: access.org.id, clerkOrgId: access.org.clerkOrgId, name: access.org.name },
    mode: access.mode,
    membership: access.membership,
  }
}

export async function getMemberByClerkUserIdAction(clerkUserId: string) {
  const { org } = await authzService.requireAdmin()

  const member = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
  if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found")

  return { member: toMemberDTO(member) }
}

export async function patchMemberByClerkUserIdAction(clerkUserId: string, body: unknown) {
  const { org } = await authzService.requireAdmin()

  const data = PatchMemberBodySchema.parse(body)

  let updated = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
  if (!updated) throw new HttpError(404, "NOT_FOUND", "Member not found")

  if (data.role) updated = await membersService.setRole(org.id, clerkUserId, data.role)

  if (data.status) {
    const now = new Date()
    const timestamps =
      data.status === MembershipStatus.INVITED
        ? { invitedAt: now, disabledAt: null }
        : data.status === MembershipStatus.ACTIVE
          ? { activatedAt: now, disabledAt: null }
          : { disabledAt: now }

    updated = await membersService.setStatus(org.id, clerkUserId, data.status, timestamps)
  }

  return { member: toMemberDTO(updated) }
}
