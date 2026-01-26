// modules/invitations/routes/invitations.routes.ts
import { ok, fail } from "@/lib/http/response"
import { invitationsService } from "../invitations.service"
import { CreateInviteSchema, ListInvitesSchema } from "../invitations.schema"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const input = ListInvitesSchema.parse({
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
      offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
    })

    const data = await invitationsService.list(req.headers, input)
    return ok(data)
  } catch (e) {
    return fail(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = CreateInviteSchema.parse(body)

    const data = await invitationsService.create(req.headers, input)
    return ok(data, 201)
  } catch (e) {
    return fail(e)
  }
}
