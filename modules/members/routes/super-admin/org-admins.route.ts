import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
const AdminRoleSchema = z.enum(["owner", "admin"])

const ParamsSchema = z.object({ orgId: z.string().min(1) })

const CreateAdminSchema = z.object({
  email: z.string().email(),
  role: AdminRoleSchema.default("admin"),
})

type AdminDto = {
  id: string
  role: string
  status: "ACTIVE" | "DISABLED"
  createdAt: Date
  user: { id: string; name: string | null; email: string | null }
}

function toAdminDto(member: {
  id: string
  role: string
  status: "ACTIVE" | "DISABLED"
  createdAt: Date
  user: { id: string; name: string | null; email: string | null }
}): AdminDto {
  return {
    id: member.id,
    role: member.role,
    status: member.status,
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
        orgId,
        role: { in: ["admin", "owner"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })

    return ok(rows.map(toAdminDto))
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
    const input = CreateAdminSchema.parse(body)

    if (input.role === "owner") {
      throw new AppError("BAD_REQUEST", "Cannot promote to owner")
    }

    const user = await prisma.user.findFirst({
      where: { email: input.email.toLowerCase() },
      select: { id: true, email: true, name: true },
    })

    if (!user) throw new AppError("NOT_FOUND", "User not found for email")

    const existing = await prisma.member.findFirst({
      where: { orgId, userId: user.id },
      include: { user: true },
    })

    if (existing) {
      if (existing.role === "owner") {
        throw new AppError("BAD_REQUEST", "Owner role is immutable")
      }
      const updated = await prisma.member.update({
        where: { id: existing.id },
        data: { role: input.role, status: "ACTIVE" },
        include: { user: true },
      })
      return ok(toAdminDto(updated))
    }

    const created = await prisma.member.create({
      data: {
        orgId,
        userId: user.id,
        role: input.role,
        status: "ACTIVE",
        createdAt: new Date(),
      },
      include: { user: true },
    })

    return ok(toAdminDto(created), 201)
  } catch (e: any) {
    return fail(e)
  }
}
