import { prisma } from "@/lib/db/prisma"

export const superAdminRepo = {
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
