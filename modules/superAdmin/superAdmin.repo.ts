import { prisma } from "@/lib/prisma"

export async function setAppUserSuperAdmin(clerkUserId: string, isSuperAdmin: boolean) {
  return prisma.appUser.upsert({
    where: { clerkUserId },
    update: { isSuperAdmin },
    create: { clerkUserId, isSuperAdmin },
  })
}

export async function findAppUserByClerkUserId(clerkUserId: string) {
  return prisma.appUser.findUnique({ where: { clerkUserId } })
}
