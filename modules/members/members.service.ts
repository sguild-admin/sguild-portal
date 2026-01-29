// modules/members/members.service.ts
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { coachProfilesRepo } from "@/modules/coach-profiles/coach-profiles.repo"
import { membersRepo } from "./members.repo"

type ListMembersInput = Partial<{
  role: "owner" | "admin" | "member"
  status: "ACTIVE" | "DISABLED"
  limit: number
  offset: number
}>

type MemberRole = "owner" | "admin" | "member"
type MemberStatus = "ACTIVE" | "DISABLED"

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
      const statusOk = input?.status ? String(m.status ?? "ACTIVE") === input.status : true
      return roleOk && statusOk
    })

    return filtered
  },

  async updateRole(headers: Headers, input: { memberId: string; role: MemberRole }) {
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

  async setRole(orgId: string, userId: string, role: MemberRole) {
    return membersRepo.setRole(orgId, userId, role)
  },

  async setStatus(orgId: string, userId: string, status: MemberStatus) {
    return membersRepo.setStatus(orgId, userId, status)
  },

  async disableAccess(orgId: string, userId: string) {
    return prisma.$transaction([
      prisma.member.update({
        where: { organizationId_userId: { organizationId: orgId, userId } },
        data: { status: "DISABLED" },
      }),
      prisma.coachProfile.updateMany({
        where: { orgId, userId },
        data: { status: "DISABLED" },
      }),
    ])
  },

  async demoteAdminToCoach(orgId: string, userId: string) {
    return prisma.$transaction([
      prisma.member.update({
        where: { organizationId_userId: { organizationId: orgId, userId } },
        data: { role: "member", status: "ACTIVE" },
      }),
      coachProfilesRepo.upsertStatus(orgId, userId, "ACTIVE"),
    ])
  },
}
