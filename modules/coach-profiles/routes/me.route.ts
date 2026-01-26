import { ok, fail } from "@/lib/http/response"
import { coachProfilesService } from "../coach-profiles.service"
import { UpsertCoachProfileSchema } from "../coach-profiles.schema"
import { toCoachProfileDto } from "../coach-profiles.dto"

export async function GET(req: Request) {
  try {
    const row = await coachProfilesService.getMine(req.headers)
    return ok(row ? toCoachProfileDto(row as any) : null)
  } catch (e: any) {
    return fail(e)
  }
}

export async function PUT(req: Request) {
  try {
    const body = UpsertCoachProfileSchema.parse(await req.json())
    const row = await coachProfilesService.upsertMine(req.headers, body)
    return ok(toCoachProfileDto(row as any))
  } catch (e: any) {
    return fail(e)
  }
}
