import { prisma } from "@/lib/db/prisma"
import type { CoachStatus } from "@prisma/client"

export type CoachProfileUpsert = Partial<{
  nickname: string | null
  bio: string | null
  notes: string | null
  address: string | null
  zip: string | null
  phone: string | null
}>

export const coachProfilesRepo = {
  getById(id: string) {
    return prisma.coachProfile.findUnique({
      where: { id },
      include: { user: true, org: true },
    })
  },

  getByOrgUser(orgId: string, userId: string) {
    return prisma.coachProfile.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })
  },

  getByUserAndOrg(userId: string, orgId: string) {
    return prisma.coachProfile.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })
  },

  listByOrg(orgId: string) {
    return prisma.coachProfile.findMany({
      where: { orgId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  listActiveByOrg(orgId: string) {
    return prisma.coachProfile.findMany({
      where: { orgId, status: "ACTIVE" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  listDisabledByOrg(orgId: string) {
    return prisma.coachProfile.findMany({
      where: { orgId, status: "DISABLED" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  },

  async ensure(orgId: string, userId: string) {
    const existing = await prisma.coachProfile.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })
    if (existing) return existing

    return prisma.coachProfile.create({
      data: { orgId, userId },
    })
  },

  upsert(orgId: string, userId: string, data: CoachProfileUpsert) {
    return prisma.coachProfile.upsert({
      where: { orgId_userId: { orgId, userId } },
      create: {
        orgId,
        userId,
        status: "ACTIVE",
        ...data,
      },
      update: data,
    })
  },

  upsertStatus(orgId: string, userId: string, status: CoachStatus) {
    return prisma.coachProfile.upsert({
      where: { orgId_userId: { orgId, userId } },
      create: {
        orgId,
        userId,
        status,
      },
      update: { status },
    })
  },

  setStatus(orgId: string, userId: string, status: CoachStatus) {
    return prisma.coachProfile.update({
      where: { orgId_userId: { orgId, userId } },
      data: { status },
    })
  },
}
