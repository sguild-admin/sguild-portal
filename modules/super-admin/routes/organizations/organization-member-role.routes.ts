import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { toSuperAdminOrgMemberDto } from "@/modules/super-admin/super-admin.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
})

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)
    const body = await req.json()
    const input = UpdateRoleSchema.parse(body)

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

    if (member.role === "coach") {
      throw new AppError("BAD_REQUEST", "Use coach endpoints to change coach roles")
    }

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { role: input.role },
      include: { user: true, coachProfile: { select: { id: true } } },
    })

    return ok(toSuperAdminOrgMemberDto(updated))
  } catch (e: any) {
    return fail(e)
  }
}
