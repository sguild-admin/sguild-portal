import { prisma } from "@/lib/db/prisma"
import type { OrgRole } from "@prisma/client"

export type MemberRole = OrgRole

export const membersRepo = {
  getById(memberId: string) {
    return prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, organization: true },
    })
  },

  getByUserAndOrg(userId: string, orgId: string) {
    return prisma.member.findFirst({
      where: { userId, orgId },
    })
  },

  listByOrg(orgId: string) {
    return prisma.member.findMany({
      where: { orgId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  listByOrgAndRole(orgId: string, role: MemberRole) {
    return prisma.member.findMany({
      where: { orgId, role },
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
      data: { userId, orgId, role, createdAt: new Date() },
    })
  },

  delete(memberId: string) {
    return prisma.member.delete({
      where: { id: memberId },
    })
  },

  updateRoleByUserAndOrg(userId: string, orgId: string, role: MemberRole) {
    return prisma.member.updateMany({
      where: { userId, orgId },
      data: { role },
    })
  },

  upsertByUserAndOrg(userId: string, orgId: string, role: MemberRole) {
    return prisma.member.upsert({
      where: { orgId_userId: { orgId, userId } },
      update: { role },
      create: { userId, orgId, role, createdAt: new Date() },
    })
  },
}
