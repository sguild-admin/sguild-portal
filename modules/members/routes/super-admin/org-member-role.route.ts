import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { MemberRoleSchema } from "../../members.schema"

const ParamsSchema = z.object({ orgId: z.string().min(1), userId: z.string().min(1) })

const UpdateRoleSchema = z.object({
  role: MemberRoleSchema,
})

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, userId } = ParamsSchema.parse(params)
    const body = await req.json()
    const input = UpdateRoleSchema.parse(body)

    const member = await prisma.member.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    })

    if (!member) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    if (member.role === "owner" && input.role !== "owner") {
      const ownerCount = await prisma.member.count({
        where: { organizationId: orgId, role: "owner" },
      })
      if (ownerCount <= 1) {
        throw new AppError("BAD_REQUEST", "Organization must have an owner")
      }
    }

    const updated = await prisma.member.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { role: input.role },
    })

    return ok({ userId, role: updated.role, status: updated.status })
  } catch (e: any) {
    return fail(e)
  }
}
