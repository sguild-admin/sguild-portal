import { prisma } from "@/lib/db/prisma"

export const superAdminRepo = {
  async slugExists(slug: string) {
    const found = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
    return Boolean(found)
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
      }),
      prisma.organization.count({ where }),
    ])

    return { rows, total }
  },
}
