import { ok, fail } from "@/lib/http/response"
import { superAdminService } from "../super-admin.service"
import { superAdminSchemas } from "../super-admin.schema"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const input = superAdminSchemas.listOrgs.parse({
      q: url.searchParams.get("q") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    })

    const data = await superAdminService.listOrgs(req.headers, input)
    return ok(data)
  } catch (e) {
    return fail(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = superAdminSchemas.createOrg.parse(body)

    const data = await superAdminService.createOrg(req.headers, input)
    return ok(data, 201)
  } catch (e) {
    return fail(e)
  }
}
