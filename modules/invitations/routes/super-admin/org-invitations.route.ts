import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { invitationsService } from "../../invitations.service"
import { createOrgInviteSchema } from "../../invitations.schema"

const ParamsSchema = z.object({ orgId: z.string().min(1) })

export async function GET(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)
    const data = await invitationsService.listOrgInvitesForSuperAdmin(req.headers, { orgId })
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const body = await req.json()
    const params = await ctx.params
    const parsedParams = ParamsSchema.safeParse(params ?? {})
    const orgId = parsedParams.success ? parsedParams.data.orgId : body?.orgId
    const input = createOrgInviteSchema.parse({ ...body, orgId })

    const data = await invitationsService.createOrgAdminInviteForSuperAdmin(req.headers, input)
    return ok(data, 201)
  } catch (e: any) {
    return fail(e)
  }
}
