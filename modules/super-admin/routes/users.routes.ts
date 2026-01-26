import { ok, fail } from "@/lib/http/response"
import { superAdminService } from "../super-admin.service"
import { superAdminSchemas } from "../super-admin.schema"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const input = superAdminSchemas.listUsers.parse({
      searchValue: url.searchParams.get("searchValue") ?? undefined,
      searchField: (url.searchParams.get("searchField") as any) ?? undefined,
      searchOperator: (url.searchParams.get("searchOperator") as any) ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
      sortBy: url.searchParams.get("sortBy") ?? undefined,
      sortDirection: (url.searchParams.get("sortDirection") as any) ?? undefined,
      filterField: url.searchParams.get("filterField") ?? undefined,
      filterValue: url.searchParams.get("filterValue") ?? undefined,
      filterOperator: (url.searchParams.get("filterOperator") as any) ?? undefined,
    })

    const data = await superAdminService.listUsers(req.headers, input)
    return ok(data)
  } catch (e) {
    return fail(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = superAdminSchemas.createUser.parse(body)

    const data = await superAdminService.createUser(req.headers, input)
    return ok(data, 201)
  } catch (e) {
    return fail(e)
  }
}
