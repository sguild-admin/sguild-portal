import { prisma } from "@/lib/prisma"

export async function getOrganizationByClerkOrgId(clerkOrgId: string) {
  return prisma.organization.findUnique({ where: { clerkOrgId } })
}

export async function createOrganization(clerkOrgId: string, name: string) {
  return prisma.organization.create({ data: { clerkOrgId, name } })
}

export async function listOrganizations() {
  return prisma.organization.findMany({ orderBy: { createdAt: "desc" } })
}

export async function updateOrganizationByClerkOrgId(clerkOrgId: string, data: { name?: string; primaryAdminClerkUserId?: string }) {
  return prisma.organization.updateMany({ where: { clerkOrgId }, data })
}
