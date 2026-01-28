import { ok, fail } from "@/lib/http/response"
import { invitationsService } from "../../invitations.service"
import { acceptInviteSchema } from "../../invitations.schema"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = acceptInviteSchema.parse(body)

    const data = await invitationsService.acceptInvite(req.headers, input)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
