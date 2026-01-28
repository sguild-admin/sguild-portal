import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { MemberRoleSchema } from "../../members.schema"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateRoleSchema = z.object({
  role: MemberRoleSchema,
})

function toAdminDto(member: {
  id: string
  role: string
  createdAt: Date
  user: { id: string; name: string | null; email: string | null }
}) {
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
      include: { user: true },
    })

    if (!member || member.organizationId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { role: input.role },
      include: { user: true },
    })

    return ok(toAdminDto(updated))
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
      include: { user: true },
    })

    if (!member || member.organizationId !== orgId) {
      throw new AppError("NOT_FOUND", "Member not found")
    }

    await prisma.member.delete({ where: { id: memberId } })

    return ok({ id: memberId })
  } catch (e: any) {
    return fail(e)
  }
}
