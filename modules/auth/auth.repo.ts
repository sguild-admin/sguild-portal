import { prisma } from "@/lib/prisma"

export async function getAppUserByClerkUserId(clerkUserId: string) {
  return prisma.appUser.findUnique({ where: { clerkUserId } })
}

export async function ensureAppUser(clerkUserId: string) {
  const existing = await getAppUserByClerkUserId(clerkUserId)
  if (existing) return existing
  return prisma.appUser.create({ data: { clerkUserId } })
}

export async function getOrganizationByClerkOrgId(clerkOrgId: string) {
  return prisma.organization.findUnique({ where: { clerkOrgId } })
}

export async function getOrgMembershipByOrgIdAndClerkUserId(orgId: string, clerkUserId: string) {
  return prisma.orgMembership.findUnique({ where: { orgId_clerkUserId: { orgId, clerkUserId } } })
}
