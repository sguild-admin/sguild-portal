import "server-only"

import { authzService } from "@/modules/authz/authz.service"
import { coachProfilesService } from "@/modules/coachProfiles/coachProfiles.service"
import { PatchCoachProfileBodySchema } from "@/modules/coachProfiles/coachProfiles.schema"
import { toCoachProfileDTO } from "@/modules/coachProfiles/coachProfiles.dto"
import { usersService } from "@/modules/users/users.service"

export async function getMyCoachProfileAction() {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)

  const profile = await coachProfilesService.getByAppUserId(user.id)
  if (!profile) return { profile: null }

  return { profile: toCoachProfileDTO(profile) }
}

export async function upsertMyCoachProfileAction(body: unknown) {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)

  const data = PatchCoachProfileBodySchema.parse(body)

  const profile = await coachProfilesService.upsertByAppUserId(user.id, {
    bio: data.bio ?? null,
    notes: data.notes ?? null,
    zip: data.zip ?? null,
  })

  return { profile: toCoachProfileDTO(profile) }
}
