import { ok, fail } from "@/lib/http/response"
import { orgSettingsService } from "../org-settings.service"
import { UpdateOrgSettingsSchema } from "../org-settings.schema"
import { toOrgSettingsDto } from "../org-settings.dto"

export async function GET(req: Request) {
  try {
    const settings = await orgSettingsService.get(req.headers)
    return ok(toOrgSettingsDto(settings))
  } catch (e: any) {
    return fail(e)
  }
}

export async function PATCH(req: Request) {
  try {
    const body = UpdateOrgSettingsSchema.parse(await req.json())
    const settings = await orgSettingsService.update(req.headers, body)
    return ok(toOrgSettingsDto(settings))
  } catch (e: any) {
    return fail(e)
  }
}
