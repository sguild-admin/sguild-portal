import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { CoachStatusSchema } from "@/modules/coach-profiles/coach-profiles.schema"
import { membersService } from "../../members.service"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateCoachSchema = z.object({
  coachStatus: CoachStatusSchema,
})

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const { session } = await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)
    const body = await req.json()
    const input = UpdateCoachSchema.parse(body)

    if (!session?.userId) throw new AppError("UNAUTHENTICATED")

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { coachProfile: { select: { id: true } } },
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be disabled")
    }

    const updated = await membersService.setCoachStatus(
      orgId,
      member.userId,
      input.coachStatus
    )

    if (!updated) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    return ok({
      id: memberId,
      memberStatus: updated.status,
      coachStatus: updated.coachProfile ? updated.status : null,
    })
  } catch (e: any) {
    return fail(e)
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const { session } = await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)
    const body = await req.json().catch(() => ({}))
    const reason = z.object({ reason: z.string().min(1).optional() }).parse(body).reason

    if (!session?.userId) throw new AppError("UNAUTHENTICATED")

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner") {
      throw new AppError("BAD_REQUEST", "Owner membership cannot be removed")
    }

    const result = await membersService.deleteByMemberId(memberId, reason)

    return ok(result)
  } catch (e: any) {
    return fail(e)
  }
}
