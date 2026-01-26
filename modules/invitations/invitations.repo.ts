import { prisma } from "@/lib/db/prisma"

export const invitationsRepo = {
  listByOrg(orgId: string) {
    return prisma.invitation.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    })
  },

  listByOrgAndEmail(orgId: string, email: string) {
    return prisma.invitation.findMany({
      where: { organizationId: orgId, email },
      orderBy: { createdAt: "desc" },
    })
  },

  getById(invitationId: string) {
    return prisma.invitation.findUnique({
      where: { id: invitationId },
    })
  },

  setStatus(invitationId: string, status: string) {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: { status },
    })
  },
}
