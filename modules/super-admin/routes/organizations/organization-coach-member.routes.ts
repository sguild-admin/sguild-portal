import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { toSuperAdminOrgMemberDto } from "@/modules/super-admin/super-admin.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, coachProfile: { select: { id: true } } },
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner role is immutable")
    }

    if (!member.coachProfile) {
      throw new AppError("BAD_REQUEST", "Member is not a coach")
    }

    const [updated] = await prisma.$transaction([
      prisma.coachProfile.delete({ where: { memberId } }),
      prisma.member.update({
        where: { id: memberId },
        data: { role: "member" },
        include: { user: true, coachProfile: { select: { id: true } } },
      }),
    ])

    return ok(toSuperAdminOrgMemberDto(updated))
  } catch (e: any) {
    return fail(e)
  }
}
