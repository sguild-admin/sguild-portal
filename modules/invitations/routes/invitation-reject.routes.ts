// modules/invitations/routes/invitation-reject.routes.ts
import { ok, fail } from "@/lib/http/response"
import { invitationsService } from "../invitations.service"

export async function POST(req: Request, ctx: { params: Promise<{ invitationId: string }> }) {
  try {
    const { invitationId } = await ctx.params
    const data = await invitationsService.reject(req.headers, invitationId)
    return ok(data)
  } catch (e) {
    return fail(e)
  }
}
