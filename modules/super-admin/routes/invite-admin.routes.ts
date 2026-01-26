import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { superAdminService } from "../super-admin.service"

const InviteAdminSchema = z.object({
  email: z.string().trim().email(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  resend: z.boolean().optional(),
})

export async function POST(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await ctx.params
    const body = await req.json()
    const input = InviteAdminSchema.parse(body)

    const data = await superAdminService.inviteOrgAdmin(req.headers, {
      organizationId: orgId,
      email: input.email,
      expiresInDays: input.expiresInDays,
      resend: input.resend,
    })

    return ok(data, 201)
  } catch (e) {
    return fail(e)
  }
}
