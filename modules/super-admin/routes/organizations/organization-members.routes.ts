import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { toSuperAdminOrgMemberDto } from "@/modules/super-admin/super-admin.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1) })

const roleOrder: Record<string, number> = {
  owner: 0,
  admin: 1,
  coach: 2,
  member: 3,
}

function getDisplayName(name: string | null, email: string | null) {
  const trimmedName = name?.trim()
  if (trimmedName) return trimmedName
  return email?.trim() ?? ""
}

export async function GET(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)

    const rows = await prisma.member.findMany({
      where: { orgId },
      include: {
        user: true,
        coachProfile: { select: { id: true } },
      },
    })

    rows.sort((a, b) => {
      const roleDiff = (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99)
      if (roleDiff !== 0) return roleDiff
      const nameA = getDisplayName(a.user?.name ?? null, a.user?.email ?? null).toLowerCase()
      const nameB = getDisplayName(b.user?.name ?? null, b.user?.email ?? null).toLowerCase()
      return nameA.localeCompare(nameB)
    })

    return ok(rows.map(toSuperAdminOrgMemberDto))
  } catch (e: any) {
    return fail(e)
  }
}
