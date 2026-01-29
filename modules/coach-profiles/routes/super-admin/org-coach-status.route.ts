import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { coachProfilesService } from "../../coach-profiles.service"
import { CoachStatusSchema } from "../../coach-profiles.schema"
import { toCoachProfileDto } from "../../coach-profiles.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateCoachStatusSchema = z.object({
  status: CoachStatusSchema,
})

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)
    const userId = memberId
    const body = await req.json()
    const input = UpdateCoachStatusSchema.parse(body)

    const profile =
      input.status === "ACTIVE"
        ? await coachProfilesService.enableCoach(req.headers, { orgId, userId })
        : await coachProfilesService.disableCoach(req.headers, { orgId, userId })

    return ok(toCoachProfileDto(profile as any))
  } catch (e: any) {
    return fail(e)
  }
}
