import { ok, fail } from "@/lib/http/response"
import { invitationsService } from "../invitations.service"
import { z } from "zod"

const RespondSchema = z.object({
  invitationId: z.string().min(1),
  action: z.enum(["accept", "reject"]),
})

export async function POST(req: Request) {
  try {
    const body = RespondSchema.parse(await req.json())
    const data =
      body.action === "accept"
        ? await invitationsService.accept(req.headers, { invitationId: body.invitationId })
        : await invitationsService.reject(req.headers, { invitationId: body.invitationId })

    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
