import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { invitationsService } from "../../invitations.service"
import { revokeInviteSchema } from "../../invitations.schema"

const ParamsSchema = z.object({ inviteId: z.string().min(1) })

export async function POST(req: Request, ctx: { params: Promise<{ inviteId: string }> }) {
  try {
    const params = await ctx.params
    const { inviteId } = ParamsSchema.parse(params)
    const input = revokeInviteSchema.parse({ inviteId })

    const data = await invitationsService.revokeInviteForSuperAdmin(req.headers, input)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
