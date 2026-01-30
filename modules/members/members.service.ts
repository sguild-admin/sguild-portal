// modules/members/members.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { prisma } from "@/lib/db/prisma"
import type { CoachStatus } from "@prisma/client"

type ListMembersInput = Partial<{
  role: "owner" | "admin" | "member"
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

  async updateRole(headers: Headers, input: { memberId: string; role: "owner" | "admin" | "member" }) {
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

  async setCoachStatus(orgId: string, userId: string, coachStatus: CoachStatus) {
    const member = await prisma.member.findFirst({ where: { orgId, userId } })
    if (!member) throw new Error("Member not found")

    await prisma.coachProfile.upsert({
      where: { orgId_userId: { orgId, userId } },
      create: { orgId, userId, status: coachStatus },
      update: { status: coachStatus },
    })

    const updated = await prisma.member.findFirst({
      where: { orgId, userId },
      include: { coachProfile: true },
    })
    if (!updated) throw new Error("Member not found")
    return updated
  },

  async deleteByMemberId(memberId: string, _reason?: string) {
    await prisma.member.delete({ where: { id: memberId } })
    return { id: memberId }
  },
}
