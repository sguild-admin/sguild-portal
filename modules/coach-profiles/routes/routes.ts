import { ok, fail } from "@/lib/http/response"
import { coachProfilesService } from "../coach-profiles.service"
import { toCoachProfileDto } from "../coach-profiles.dto"

export async function GET(req: Request) {
  try {
    const rows = await coachProfilesService.listForOrg(req.headers)
    return ok(rows.map((r: any) => toCoachProfileDto(r)))
  } catch (e: any) {
    return fail(e)
  }
}
