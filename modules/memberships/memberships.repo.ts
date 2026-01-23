import { prisma } from "@/lib/prisma"

export async function createMembership(orgId: string, clerkUserId: string, role: "ADMIN" | "COACH") {
  return prisma.orgMembership.create({ data: { orgId, clerkUserId, role } })
}

export async function updateMembershipStatus(id: string, status: "INVITED" | "ACTIVE" | "DISABLED") {
  return prisma.orgMembership.update({ where: { id }, data: { status } })
}

export async function listMembersByOrgId(orgId: string) {
  return prisma.orgMembership.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } })
}

export async function getMembershipById(id: string) {
  return prisma.orgMembership.findUnique({ where: { id } })
}

export async function upsertMembershipAssignAdmin(orgId: string, clerkUserId: string) {
  return prisma.orgMembership.upsert({
    where: { orgId_clerkUserId: { orgId, clerkUserId } },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: { orgId, clerkUserId, role: "ADMIN", status: "ACTIVE" },
  })
}
