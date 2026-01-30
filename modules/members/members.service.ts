// modules/members/members.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { prisma } from "@/lib/db/prisma"
import { AppError } from "@/lib/http/errors"
import type { CoachStatus } from "@/modules/coach-profiles/coach-profiles.schema"

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

    if (input.role === "owner") {
      throw new AppError("BAD_REQUEST", "Cannot promote to owner")
    }

    const list = await membersService.list(headers, { limit: 500, offset: 0 })
    const target = Array.isArray(list) ? list.find((m: any) => m.id === input.memberId) : null
    if (target?.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner role is immutable")
    }

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

    const list = await membersService.list(headers, { limit: 500, offset: 0 })
    const target = Array.isArray(list)
      ? list.find(
          (m: any) => m.id === input.memberIdOrEmail || m?.user?.email === input.memberIdOrEmail
        )
      : null

    if (target?.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be removed")
    }

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

    if (member.role === "owner" && coachStatus === "DISABLED") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be disabled")
    }

    const existingProfile = await prisma.coachProfile.findUnique({
      where: { memberId: member.id },
    })

    if (!existingProfile) {
      await prisma.coachProfile.create({
        data: { memberId: member.id },
      })
    }

    return prisma.member.update({
      where: { id: member.id },
      data: { status: coachStatus },
      include: { coachProfile: true },
    })
  },

  async deleteByMemberId(memberId: string, _reason?: string) {
    const member = await prisma.member.findUnique({ where: { id: memberId } })
    if (!member) throw new AppError("NOT_FOUND", "Member not found")
    if (member.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be removed")
    }

    await prisma.member.delete({ where: { id: memberId } })
    return { id: memberId }
  },
}
