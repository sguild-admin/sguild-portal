import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { invitationsService } from "../../invitations.service"
import { resendInviteSchema } from "../../invitations.schema"

const ParamsSchema = z.object({ inviteId: z.string().min(1) })

export async function POST(req: Request, ctx: { params: Promise<{ inviteId: string }> }) {
  try {
    const params = await ctx.params
    const { inviteId } = ParamsSchema.parse(params)
    const body = await req.json().catch(() => ({}))
    const input = resendInviteSchema.parse({ ...body, inviteId })

    const data = await invitationsService.resendInviteForSuperAdmin(req.headers, input)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
