import { z } from "zod"
import { ok, fail } from "@/lib/http/response"
import { AppError } from "@/lib/http/errors"
import { prisma } from "@/lib/db/prisma"
import { requireSuperAdmin } from "@/lib/auth/guards"
import { coachAvailabilityRepo } from "@/modules/coach-availability"
import { CoachAvailabilityListSchema } from "@/modules/coach-availability/coach-availability.schema"
import { CoachStatusSchema, UpsertCoachProfileSchema } from "../coach-profiles.schema"
import { toCoachProfileDto } from "../coach-profiles.dto"

const ParamsSchema = z.object({ orgId: z.string().min(1), memberId: z.string().min(1) })

const UpdateCoachProfileSchema = z.object({
  status: CoachStatusSchema.optional(),
  profile: UpsertCoachProfileSchema.optional(),
  availability: CoachAvailabilityListSchema.optional(),
})

export async function GET(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, organizationId: true, userId: true },
    })

    if (!member || member.organizationId !== orgId) {
      throw new AppError("NOT_FOUND", "Coach not found")
    }

    const userId = member.userId

    let profile = await prisma.coachProfile.findUnique({
      where: { orgId_userId: { orgId, userId } },
      include: { user: true, availabilities: true },
    })

    if (!profile) {
      profile = await prisma.coachProfile.create({
        data: { orgId, userId, status: "ACTIVE" },
        include: { user: true, availabilities: true },
      })
    }

    return ok(toCoachProfileDto(profile as any))
  } catch (e: any) {
    return fail(e)
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    await requireSuperAdmin(req.headers)
    const params = await ctx.params
    const { orgId, memberId } = ParamsSchema.parse(params)
    const body = await req.json()
    const input = UpdateCoachProfileSchema.parse(body)

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, organizationId: true, userId: true },
    })

    if (!member || member.organizationId !== orgId) {
      throw new AppError("NOT_FOUND", "Coach not found")
    }

    const userId = member.userId

    const updateData = {
      ...(input.profile ?? {}),
      ...(input.status ? { status: input.status } : {}),
    }

    let profile = await prisma.coachProfile.upsert({
      where: { orgId_userId: { orgId, userId } },
      create: {
        orgId,
        userId,
        status: input.status ?? "ACTIVE",
        ...(input.profile ?? {}),
      },
      update: updateData,
      include: { user: true, availabilities: true },
    })

    if (input.availability) {
      await coachAvailabilityRepo.replaceForCoachProfile(profile.id, input.availability)
      profile = await prisma.coachProfile.findUnique({
        where: { orgId_userId: { orgId, userId } },
        include: { user: true, availabilities: true },
      })
    }

    if (!profile) {
      throw new AppError("NOT_FOUND", "Coach profile not found")
    }

    return ok(toCoachProfileDto(profile as any))
  } catch (e: any) {
    return fail(e)
  }
}
