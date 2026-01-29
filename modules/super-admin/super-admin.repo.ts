import { prisma } from "@/lib/db/prisma"

export const superAdminRepo = {
  async slugExists(slug: string) {
    const found = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
    return Boolean(found)
  },

  async getOrganizationBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
  },

  async createOrgWithOwner(args: {
    orgId: string
    name: string
    slug: string
    ownerUserId: string
  }) {
    const now = new Date()

    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          id: args.orgId,
          name: args.name,
          slug: args.slug,
        },
        select: { id: true, name: true, slug: true, createdAt: true },
      })

      await tx.orgSettings.create({
        data: { orgId: org.id },
        select: { id: true },
      })

      await tx.member.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: org.id,
          userId: args.ownerUserId,
          role: "owner",
          createdAt: now,
        },
        select: { id: true },
      })

      return org
    })
  },
  async listOrganizations(params: { q?: string; limit: number; offset: number }) {
    const where = params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { slug: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : undefined

    const [rows, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: params.limit,
        skip: params.offset,
        include: {
          _count: {
            select: {
              members: {
                where: {
                  role: { notIn: ["admin", "owner"] },
                },
              },
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ])

    return { rows, total }
  },

  async getOrganizationById(orgId: string) {
    return prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: {
              where: {
                role: { notIn: ["admin", "owner"] },
              },
            },
          },
        },
        settings: true,
      },
    })
  },

  async updateOrganization(orgId: string, data: { name?: string; slug?: string }) {
    return prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.slug ? { slug: data.slug } : {}),
      },
      include: {
        _count: {
          select: {
            members: {
              where: {
                role: { notIn: ["admin", "owner"] },
              },
            },
          },
        },
        settings: true,
      },
    })
  },

  async deleteOrganization(orgId: string) {
    return prisma.organization.delete({
      where: { id: orgId },
    })
  },
}
