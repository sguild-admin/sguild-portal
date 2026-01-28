import { z } from "zod"
import { ok, fail, toHttpStatus } from "@/lib/http/response"
import { superAdminService } from "../super-admin.service"
import { superAdminSchemas } from "../super-admin.schema"

const ParamsSchema = z.object({ orgId: z.string().min(1) })

export async function GET(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)
    const data = await superAdminService.getOrg(req.headers, { orgId })
    return ok(data)
  } catch (e) {
    return fail(e, toHttpStatus(e))
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)
    const body = await req.json()
    const input = superAdminSchemas.updateOrg.parse(body)

    const data = await superAdminService.updateOrg(req.headers, {
      orgId,
      data: input,
    })

    return ok(data)
  } catch (e) {
    return fail(e, toHttpStatus(e))
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const params = await ctx.params
    const { orgId } = ParamsSchema.parse(params)
    const data = await superAdminService.deleteOrg(req.headers, { orgId })
    return ok(data)
  } catch (e) {
    return fail(e, toHttpStatus(e))
  }
}
