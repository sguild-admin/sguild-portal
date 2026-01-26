import { ok, fail } from "@/lib/http/response"
import { coachProfilesService } from "../coach-profiles.service"
import { SetCoachStatusSchema } from "../coach-profiles.schema"
import { toCoachProfileDto } from "../coach-profiles.dto"

export async function PATCH(req: Request) {
  try {
    const body = SetCoachStatusSchema.parse(await req.json())
    const row = await coachProfilesService.setStatus(req.headers, body)
    return ok(toCoachProfileDto(row as any))
  } catch (e: any) {
    return fail(e)
  }
}
