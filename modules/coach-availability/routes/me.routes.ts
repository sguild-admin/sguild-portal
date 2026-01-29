import { ok, fail } from "@/lib/http/response"
import { coachAvailabilityService } from "../coach-availability.service"
import { CoachAvailabilityListSchema } from "../coach-availability.schema"

export async function GET(req: Request) {
  try {
    const rows = await coachAvailabilityService.listMine(req.headers)
    return ok(rows)
  } catch (e: any) {
    return fail(e)
  }
}

export async function PUT(req: Request) {
  try {
    const body = CoachAvailabilityListSchema.parse(await req.json())
    const rows = await coachAvailabilityService.setMine(req.headers, body)
    return ok(rows)
  } catch (e: any) {
    return fail(e)
  }
}
