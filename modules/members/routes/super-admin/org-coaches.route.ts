import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"

const ParamsSchema = z.object({ orgId: z.string().min(1) })

type CoachDto = {
  id: string
  role: string
  createdAt: Date
  user: { id: string; name: string | null; email: string | null }
}

function toCoachDto(member: {
  id: string
  role: string
  createdAt: Date
  user: { id: string; name: string | null; email: string | null }
}): CoachDto {
  return {
    id: member.id,
    role: member.role,
    createdAt: member.createdAt,
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

    const rows = await prisma.member.findMany({
      where: {
        organizationId: orgId,
        role: { notIn: ["admin", "owner"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })

    return ok(rows.map(toCoachDto))
  } catch (e: any) {
    return fail(e)
  }
}
