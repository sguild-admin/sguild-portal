// modules/organizations/organizations.repo.ts
import { prisma } from "@/lib/db/prisma"
import type { Organization, Prisma } from "@prisma/client"

export type OrganizationUpdateInput = {
  name?: string
  slug?: string
  logo?: string | null
  metadata?: string | null
}

export const organizationsRepo = {
  async getById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } })
  },

  async getBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { slug } })
  },

  async getManyByIds(ids: string[]): Promise<Organization[]> {
    if (!ids.length) return []
    return prisma.organization.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    })
  },

  async list(params?: { q?: string; limit?: number; offset?: number }): Promise<Organization[]> {
    const q = params?.q?.trim()
    const limit = Math.min(Math.max(params?.limit ?? 50, 1), 200)
    const offset = Math.max(params?.offset ?? 0, 0)

    const where: Prisma.OrganizationWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined

    return prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    })
  },

  async update(id: string, input: OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.logo !== undefined ? { logo: input.logo } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      },
    })
  },

  async ensureSlugUnique(slug: string, excludeOrgId?: string): Promise<boolean> {
    const existing = await prisma.organization.findFirst({
      where: {
        slug,
        ...(excludeOrgId ? { id: { not: excludeOrgId } } : {}),
      },
      select: { id: true },
    })
    return !existing
  },
}
