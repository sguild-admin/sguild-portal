import { prisma } from "@/lib/db/prisma"

export const invitationsRepo = {
  findActivePendingByOrgEmailRole: async (args: {
    orgId: string
    email: string
    role: string
    now: Date
  }) => {
    return prisma.invitation.findFirst({
      where: {
        organizationId: args.orgId,
        email: args.email.toLowerCase(),
        role: args.role,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: args.now },
      },
    })
  },

  findPendingByOrgEmailRole: async (args: { orgId: string; email: string; role: string }) => {
    return prisma.invitation.findFirst({
      where: {
        organizationId: args.orgId,
        email: args.email.toLowerCase(),
        role: args.role,
        acceptedAt: null,
        revokedAt: null,
      },
      orderBy: { createdAt: "desc" },
    })
  },

  revokePendingByOrgEmailRoleNot: async (args: {
    orgId: string
    email: string
    role: string
    revokedAt: Date
  }) => {
    return prisma.invitation.updateMany({
      where: {
        organizationId: args.orgId,
        email: args.email.toLowerCase(),
        role: { not: args.role },
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: args.revokedAt },
    })
  },

  create: async (args: {
    orgId: string
    email: string
    role: string
    expiresAt: Date
    inviterId: string
    tokenHash: string
    tokenLast4: string | null
    lastSentAt: Date
  }) => {
    return prisma.invitation.create({
      data: {
        organizationId: args.orgId,
        email: args.email.toLowerCase(),
        role: args.role,
        expiresAt: args.expiresAt,
        inviterId: args.inviterId,
        tokenHash: args.tokenHash,
        tokenLast4: args.tokenLast4,
        lastSentAt: args.lastSentAt,
      },
    })
  },

  listByOrg: async (args: { orgId: string }) => {
    return prisma.invitation.findMany({
      where: { organizationId: args.orgId },
      orderBy: { createdAt: "desc" },
    })
  },

  findById: async (args: { inviteId: string }) => {
    return prisma.invitation.findUnique({ where: { id: args.inviteId } })
  },

  updateTokenAndResend: async (args: {
    inviteId: string
    tokenHash: string
    tokenLast4: string | null
    expiresAt: Date
    lastSentAt: Date
  }) => {
    return prisma.invitation.update({
      where: { id: args.inviteId },
      data: {
        tokenHash: args.tokenHash,
        tokenLast4: args.tokenLast4,
        expiresAt: args.expiresAt,
        lastSentAt: args.lastSentAt,
      },
    })
  },

  revoke: async (args: { inviteId: string; revokedAt: Date }) => {
    return prisma.invitation.update({
      where: { id: args.inviteId },
      data: { revokedAt: args.revokedAt },
    })
  },

  findByTokenHash: async (args: { tokenHash: string }) => {
    return prisma.invitation.findUnique({
      where: { tokenHash: args.tokenHash },
    })
  },

  markAccepted: async (args: { inviteId: string; acceptedAt: Date }) => {
    return prisma.invitation.update({
      where: { id: args.inviteId },
      data: { acceptedAt: args.acceptedAt },
    })
  },
}
