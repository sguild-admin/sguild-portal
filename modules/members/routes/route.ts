import { ok, fail } from "@/lib/http/response"
import { membersService } from "../members.service"
import { ListMembersQuerySchema, UpdateMemberRoleSchema, RemoveMemberSchema } from "../members.schema"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const query = ListMembersQuerySchema.parse({
      role: url.searchParams.get("role") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
      offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
    })

    const data = await membersService.list(req.headers, query)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}

export async function PATCH(req: Request) {
  try {
    const body = UpdateMemberRoleSchema.parse(await req.json())
    const data = await membersService.updateRole(req.headers, body)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}

export async function DELETE(req: Request) {
  try {
    const body = RemoveMemberSchema.parse(await req.json())
    const data = await membersService.remove(req.headers, body)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
