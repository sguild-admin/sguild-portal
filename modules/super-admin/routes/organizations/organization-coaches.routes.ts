import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { toSuperAdminOrgMemberDto } from "@/modules/super-admin/super-admin.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1) })

const CreateCoachSchema = z.object({
  memberId: z.string().min(1),
})

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

    const rows = await prisma.member.findMany({
      where: { orgId, coachProfile: { isNot: null } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })

    return ok(
      rows.map((row) =>
        toCoachDto({
          ...row,
          role: "coach",
          status: row.status === "DISABLED" ? "DISABLED" : "ACTIVE",
        })
      )
    )
  } catch (e: any) {
    return fail(e)
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)
    const body = await req.json()
    const input = CreateCoachSchema.parse(body)

    const member = await prisma.member.findUnique({
      where: { id: input.memberId },
      include: { user: true, coachProfile: { select: { id: true } } },
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner role is immutable")
    }

    const [updated] = await prisma.$transaction([
      prisma.coachProfile.upsert({
        where: { memberId: member.id },
        update: {},
        create: { memberId: member.id },
      }),
      prisma.member.update({
        where: { id: member.id },
        data: { role: "coach" },
        include: { user: true, coachProfile: { select: { id: true } } },
      }),
    ])

    return ok(toSuperAdminOrgMemberDto(updated))
  } catch (e: any) {
    return fail(e)
  }
}
