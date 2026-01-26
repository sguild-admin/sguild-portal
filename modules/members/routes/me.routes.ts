import { ok, fail } from "@/lib/http/response"
import { membersService } from "../members.service"

export async function GET(req: Request) {
  try {
    const data = await membersService.getActiveMember(req.headers)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}
