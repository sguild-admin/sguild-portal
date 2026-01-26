import { prisma } from "@/lib/db/prisma"

export type MemberRole = "owner" | "admin" | "coach" | "member"

export const membersRepo = {
  getById(memberId: string) {
    return prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, organization: true },
    })
  },

  getByUserAndOrg(userId: string, orgId: string) {
    return prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    })
  },

  listByOrg(orgId: string) {
    return prisma.member.findMany({
      where: { organizationId: orgId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  listByOrgAndRole(orgId: string, role: MemberRole) {
    return prisma.member.findMany({
      where: { organizationId: orgId, role },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  updateRole(memberId: string, role: MemberRole) {
    return prisma.member.update({
      where: { id: memberId },
      data: { role },
    })
  },
}
