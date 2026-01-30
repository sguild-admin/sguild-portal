import { prisma } from "@/lib/db/prisma"
import { AppError } from "@/lib/http/errors"
import type { CoachStatus } from "./coach-profiles.schema"

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
      include: { member: { include: { user: true } }, availabilities: true },
    })
  },

  getByUserAndOrg(orgId: string, userId: string) {
    return prisma.coachProfile.findFirst({
      where: { member: { orgId, userId } },
      include: { member: { include: { user: true } }, availabilities: true },
    })
  },

  listByOrg(orgId: string) {
    return prisma.coachProfile.findMany({
      where: { member: { orgId } },
      include: { member: { include: { user: true } }, availabilities: true },
      orderBy: { createdAt: "desc" },
    })
  },

  async ensure(orgId: string, userId: string) {
    const existing = await prisma.coachProfile.findFirst({
      where: { member: { orgId, userId } },
      include: { member: { include: { user: true } }, availabilities: true },
    })
    if (existing) return existing

    const member = await prisma.member.findFirst({ where: { orgId, userId } })
    if (!member) throw new Error("Member not found")

    return prisma.coachProfile.create({
      data: { memberId: member.id },
      include: { member: { include: { user: true } }, availabilities: true },
    })
  },

  async upsert(orgId: string, userId: string, data: CoachProfileUpsert) {
    const member = await prisma.member.findFirst({ where: { orgId, userId } })
    if (!member) throw new Error("Member not found")

    return prisma.coachProfile.upsert({
      where: { memberId: member.id },
      create: {
        memberId: member.id,
        ...data,
      },
      update: data,
      include: { member: { include: { user: true } }, availabilities: true },
    })
  },

  async setStatus(orgId: string, userId: string, status: CoachStatus) {
    const member = await prisma.member.findFirst({ where: { orgId, userId } })
    if (!member) throw new Error("Member not found")

    if (member.role === "owner" && status === "DISABLED") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be disabled")
    }

    await prisma.member.update({
      where: { id: member.id },
      data: { status },
    })

    const existing = await prisma.coachProfile.findUnique({
      where: { memberId: member.id },
      include: { member: { include: { user: true } }, availabilities: true },
    })

    if (existing) return existing

    return prisma.coachProfile.create({
      data: { memberId: member.id },
      include: { member: { include: { user: true } }, availabilities: true },
    })
  },
}
