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
  create(userId: string, orgId: string, role: MemberRole) {
    return prisma.member.create({
      data: { userId, organizationId: orgId, role, createdAt: new Date() },
    })
  },

  delete(memberId: string) {
    return prisma.member.delete({
      where: { id: memberId },
    })
  },

  updateRoleByUserAndOrg(userId: string, orgId: string, role: MemberRole) {
    return prisma.member.updateMany({
      where: { userId, organizationId: orgId },
      data: { role },
    })
  },

  upsertByUserAndOrg(userId: string, orgId: string, role: MemberRole) {
    return prisma.member.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      update: { role },
      create: { userId, organizationId: orgId, role, createdAt: new Date() },
    })
  },
}
