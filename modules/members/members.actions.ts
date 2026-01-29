// modules/members/members.actions.ts
"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { ListMembersQuerySchema, UpdateMemberRoleSchema, RemoveMemberSchema } from "./members.schema"

export async function listMembersAction(input?: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const q = input ? ListMembersQuerySchema.parse(input) : {}
  const orgId = await requireActiveOrgId(hdrs)

  // Organization plugin supports listing members; some builds support filters, others don't
  // We pass orgId always and apply role/status filtering client-side if needed
  const result = await auth.api.listMembers({
    headers: hdrs,
    query: {
      organizationId: orgId,
      limit: q.limit ?? 200,
      offset: q.offset ?? 0,
    } as any,
  })

  // If the API returns members with role/status, filter here using q.role/q.status
  const members = (result as any)?.data ?? result
  if (!Array.isArray(members)) return result

  const filtered = members.filter((m) => {
    const roleOk = q.role ? String(m.role) === q.role : true
    const statusOk = q.status ? String(m.status ?? "ACTIVE") === q.status : true
    return roleOk && statusOk
  })

  return filtered
}

export async function getActiveMemberAction() {
  const hdrs = await headers()
  await requireSession(hdrs)
  return auth.api.getActiveMember({ headers: hdrs })
}

export async function updateMemberRoleAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const orgId = await requireActiveOrgId(hdrs)
  const data = UpdateMemberRoleSchema.parse(input)

  return auth.api.updateMemberRole({
    headers: hdrs,
    body: {
      organizationId: orgId,
      memberId: data.memberId,
      role: [data.role],
    } as any,
  })
}

export async function removeMemberAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const orgId = await requireActiveOrgId(hdrs)
  const data = RemoveMemberSchema.parse(input)

  return auth.api.removeMember({
    headers: hdrs,
    body: {
      organizationId: orgId,
      memberIdOrEmail: data.memberIdOrEmail,
    } as any,
  })
}
