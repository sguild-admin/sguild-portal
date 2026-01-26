// modules/members/members.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"

type ListMembersInput = Partial<{
  role: "owner" | "admin" | "coach" | "member"
  status: "active" | "disabled"
  limit: number
  offset: number
}>

export const membersService = {
  async getActiveMember(headers: Headers) {
    await requireSession(headers)
    return auth.api.getActiveMember({ headers })
  },

  async list(headers: Headers, input?: ListMembersInput) {
    await requireAdminOrOwner(headers)

    const orgId = await requireActiveOrgId(headers)
    const result = await auth.api.listMembers({
      headers,
      query: {
        organizationId: orgId,
        limit: input?.limit ?? 200,
        offset: input?.offset ?? 0,
      } as any,
    })

    const members = (result as any)?.data ?? result
    if (!Array.isArray(members)) return result

    const filtered = members.filter((m) => {
      const roleOk = input?.role ? String(m.role) === input.role : true
      const statusOk = input?.status ? String(m.status ?? "active") === input.status : true
      return roleOk && statusOk
    })

    return filtered
  },

  async updateRole(headers: Headers, input: { memberId: string; role: "owner" | "admin" | "coach" | "member" }) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)

    return auth.api.updateMemberRole({
      headers,
      body: {
        organizationId: orgId,
        memberId: input.memberId,
        role: [input.role],
      } as any,
    })
  },

  async remove(headers: Headers, input: { memberIdOrEmail: string }) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)

    return auth.api.removeMember({
      headers,
      body: {
        organizationId: orgId,
        memberIdOrEmail: input.memberIdOrEmail,
      } as any,
    })
  },
}
