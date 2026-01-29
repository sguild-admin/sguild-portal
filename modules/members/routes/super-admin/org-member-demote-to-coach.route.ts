import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { membersService } from "../../members.service"

const ParamsSchema = z.object({ orgId: z.string().min(1), userId: z.string().min(1) })

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, userId } = ParamsSchema.parse(params)

    const member = await prisma.member.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    })

    if (!member) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    const [updatedMember, coachProfile] = await membersService.demoteAdminToCoach(orgId, userId)

    return ok({
      userId,
      role: updatedMember.role,
      status: updatedMember.status,
      coachStatus: coachProfile.status,
    })
  } catch (e: any) {
    return fail(e)
  }
}
