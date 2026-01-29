import { prisma } from "@/lib/db/prisma"

export type MemberRole = "owner" | "admin" | "member"
export type MemberStatus = "ACTIVE" | "DISABLED"

export const membersRepo = {
  getById(memberId: string) {
    return prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, organization: true },
    })
  },

  getByOrgUser(orgId: string, userId: string) {
    return prisma.member.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
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

  listAdmins(orgId: string) {
    return prisma.member.findMany({
      where: { organizationId: orgId, role: { in: ["owner", "admin"] } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  listMembers(orgId: string) {
    return prisma.member.findMany({
      where: { organizationId: orgId, role: "member" },
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

  setRole(orgId: string, userId: string, role: MemberRole) {
    return prisma.member.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { role },
    })
  },

  setStatus(orgId: string, userId: string, status: MemberStatus) {
    return prisma.member.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { status },
    })
  },

  create(userId: string, orgId: string, role: MemberRole) {
    return prisma.member.create({
      data: { userId, organizationId: orgId, role, status: "ACTIVE", createdAt: new Date() },
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
      update: { role, status: "ACTIVE" },
      create: { userId, organizationId: orgId, role, status: "ACTIVE", createdAt: new Date() },
    })
  },
}
