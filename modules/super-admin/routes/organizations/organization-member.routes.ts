import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { toSuperAdminOrgMemberDto } from "@/modules/super-admin/super-admin.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
  disabledReason: z.string().min(1).optional(),
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
    const input = UpdateStatusSchema.parse(body)

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, coachProfile: { select: { id: true } } },
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner" && input.status === "DISABLED") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be disabled")
    }

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: {
        status: input.status,
        disabledAt: input.status === "DISABLED" ? new Date() : null,
        disabledReason: input.status === "DISABLED" ? input.disabledReason ?? null : null,
      },
      include: { user: true, coachProfile: { select: { id: true } } },
    })

    return ok(toSuperAdminOrgMemberDto(updated))
  } catch (e: any) {
    return fail(e)
  }
}

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
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be removed")
    }

    await prisma.member.delete({ where: { id: memberId } })
    return ok({ id: memberId })
  } catch (e: any) {
    return fail(e)
  }
}
