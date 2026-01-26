import { ok, fail } from "@/lib/http/response"
import { organizationsService } from "../organizations.service"
import { requireActiveOrgId } from "@/lib/auth/guards"

export async function GET(req: Request) {
  try {
    const organizationId = await requireActiveOrgId(req.headers)
    return ok({ organizationId })
  } catch (e: any) {
    return fail(e)
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as { organizationId?: string | null; organizationSlug?: string }
    const data = await organizationsService.setActive(req.headers, body)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}


