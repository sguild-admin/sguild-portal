import { ok, fail } from "@/lib/http/response"
import { z } from "zod"
import { coachProfilesService } from "../coach-profiles.service"
import { SetCoachStatusSchema } from "../coach-profiles.schema"
import { toCoachProfileDto } from "../coach-profiles.dto"

const ParamsSchema = z.object({ userId: z.string().min(1) })

export async function GET(req: Request, ctx: { params: { userId: string } }) {
  try {
    const { userId } = ParamsSchema.parse(ctx.params)
    const row = await coachProfilesService.getByUserId(req.headers, userId)
    return ok(row ? toCoachProfileDto(row as any) : null)
  } catch (e: any) {
    return fail(e)
  }
}

export async function PATCH(req: Request, ctx: { params: { userId: string } }) {
  try {
    const { userId } = ParamsSchema.parse(ctx.params)
    const body = SetCoachStatusSchema.parse({ ...(await req.json()), userId })

    const row = await coachProfilesService.setStatus(req.headers, body)
    return ok(toCoachProfileDto(row as any))
  } catch (e: any) {
    return fail(e)
  }
}
