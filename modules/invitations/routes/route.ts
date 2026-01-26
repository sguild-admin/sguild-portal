import { ok, fail } from "@/lib/http/response"
import { invitationsService } from "../invitations.service"
import { CreateInviteSchema, RevokeInviteSchema } from "../invitations.schema"

export async function GET(req: Request) {
  try {
    const data = await invitationsService.list(req.headers)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = CreateInviteSchema.parse(await req.json())
    const data = await invitationsService.create(req.headers, body)
    return ok(data, 201)
  } catch (e: any) {
    return fail(e)
  }
}

export async function DELETE(req: Request) {
  try {
    const body = RevokeInviteSchema.parse(await req.json())
    const data = await invitationsService.cancel(req.headers, body)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
