import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"

const ParamsSchema = z.object({ orgId: z.string().min(1) })

type CoachDto = {
  id: string
  role: string
  createdAt: Date
  status: "ACTIVE" | "DISABLED"
  user: { id: string; name: string | null; email: string | null }
}

function toCoachDto(member: {
  id: string
  role: string
  createdAt: Date
  status: "ACTIVE" | "DISABLED"
  user: { id: string; name: string | null; email: string | null }
}): CoachDto {
  return {
    id: member.id,
    role: member.role,
    createdAt: member.createdAt,
    status: member.status,
    user: {
      id: member.user.id,
      name: member.user.name ?? null,
      email: member.user.email ?? null,
    },
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)

    const profiles = await prisma.coachProfile.findMany({
      where: { orgId },
      select: { userId: true, status: true },
    })

    const userIds = profiles.map((profile) => profile.userId)
    if (userIds.length === 0) return ok([])

    const rows = await prisma.member.findMany({
      where: { orgId, userId: { in: userIds } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })

    const statusByUserId = new Map(profiles.map((profile) => [profile.userId, profile.status]))

    return ok(
      rows.map((row) =>
        toCoachDto({
          ...row,
          role: "coach",
          status: statusByUserId.get(row.userId) ?? "ACTIVE",
        })
      )
    )
  } catch (e: any) {
    return fail(e)
  }
}
