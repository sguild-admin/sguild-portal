import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { coachAvailabilityService } from "../coach-availability.service"
import { CoachAvailabilityListSchema } from "../coach-availability.schema"

const ParamsSchema = z.object({ userId: z.string().min(1) })

export async function GET(req: Request, ctx: { params: { userId: string } }) {
  try {
    const { userId } = ParamsSchema.parse(ctx.params)
    const rows = await coachAvailabilityService.listForUser(req.headers, userId)
    return ok(rows)
  } catch (e: any) {
    return fail(e)
  }
}

export async function PUT(req: Request, ctx: { params: { userId: string } }) {
  try {
    const { userId } = ParamsSchema.parse(ctx.params)
    const body = CoachAvailabilityListSchema.parse(await req.json())
    const rows = await coachAvailabilityService.setForUser(req.headers, userId, body)
    return ok(rows)
  } catch (e: any) {
    return fail(e)
  }
}
