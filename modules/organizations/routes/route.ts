import { ok, fail } from "@/lib/http/response"
import { organizationsService } from "../organizations.service"
import { CreateOrganizationSchema } from "../organizations.schema"

export async function GET(req: Request) {
  try {
    const data = await organizationsService.list(req.headers)
    return ok(data)
  } catch (e: any) {
    return fail(e)
  }
}

export async function POST(req: Request) {
  try {
    const body = CreateOrganizationSchema.parse(await req.json())
    const data = await organizationsService.create(req.headers, body)
    return ok(data, 201)
  } catch (e: any) {
    return fail(e)
  }
}
