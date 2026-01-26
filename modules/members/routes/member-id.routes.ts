import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { membersService } from "../members.service"
import { UpdateMemberRoleSchema } from "../members.schema"

const ParamsSchema = z.object({ memberId: z.string().min(1) })

export async function GET(req: Request, ctx: { params: { memberId: string } }) {
  try {
    const { memberId } = ParamsSchema.parse(ctx.params)

    // If your Better Auth listMembers does not support "by id", do list + find
    const list = await membersService.list(req.headers, { limit: 500, offset: 0 })
    const found = Array.isArray(list) ? list.find((m: any) => m.id === memberId) : null

    return ok(found ?? null)
  } catch (e: any) {
    return fail(e)
  }
}

export async function PATCH(req: Request, ctx: { params: { memberId: string } }) {
  try {
    const { memberId } = ParamsSchema.parse(ctx.params)
    const body = UpdateMemberRoleSchema.parse({ ...(await req.json()), memberId })

    const data = await membersService.updateRole(req.headers, body)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}

export async function DELETE(req: Request, ctx: { params: { memberId: string } }) {
  try {
    const { memberId } = ParamsSchema.parse(ctx.params)

    // Many org APIs remove by memberIdOrEmail, not memberId
    // If Better Auth supports memberId, pass it. If not, you must map memberId -> email from listMembers
    const list = await membersService.list(req.headers, { limit: 500, offset: 0 })
    const found = Array.isArray(list) ? list.find((m: any) => m.id === memberId) : null
    const memberIdOrEmail = found?.user?.email ?? memberId

    const data = await membersService.remove(req.headers, { memberIdOrEmail })
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
