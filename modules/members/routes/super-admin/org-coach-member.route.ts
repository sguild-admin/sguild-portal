import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { CoachStatus } from "@prisma/client"
import { membersService } from "../../members.service"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateCoachSchema = z.object({
  coachStatus: z.nativeEnum(CoachStatus),
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
      include: { coachProfile: { select: { status: true } } },
    })

    if (!member || member.orgId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
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
      coachStatus: updated.coachProfile?.status ?? null,
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
      const ownerCount = await prisma.member.count({
        where: { orgId, role: "owner" },
      })
      if (ownerCount <= 1) {
        throw new AppError("BAD_REQUEST", "Organization must have an owner")
      }
    }

    const result = await membersService.deleteByMemberId(memberId, reason)

    return ok(result)
  } catch (e: any) {
    return fail(e)
  }
}
