// modules/invitations/routes/invitation-by-id.routes.ts
import { ok, fail } from "@/lib/http/response"
import { invitationsService } from "../invitations.service"
import { RevokeInviteSchema } from "../invitations.schema"

export async function DELETE(_req: Request, ctx: { params: Promise<{ invitationId: string }> }) {
  try {
    const { invitationId } = await ctx.params
    const input = RevokeInviteSchema.parse({ invitationId })

    const data = await invitationsService.revoke(_req.headers, input)
    return ok(data)
  } catch (e) {
    return fail(e)
  }
}
