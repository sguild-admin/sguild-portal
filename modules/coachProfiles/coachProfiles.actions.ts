// modules/coachProfiles/coachProfiles.actions.ts
// Server actions for coach profile CRUD.
import "server-only"

import { authzService } from "@/modules/authz/authz.service"
import { coachProfilesService } from "@/modules/coachProfiles/coachProfiles.service"
import { PatchCoachProfileBodySchema } from "@/modules/coachProfiles/coachProfiles.schema"
import { toCoachProfileDTO } from "@/modules/coachProfiles/coachProfiles.dto"
import { usersService } from "@/modules/users/users.service"
import { membersService } from "@/modules/members/members.service"
import { HttpError } from "@/modules/authz/authz.service"

// Fetch the current user's coach profile (if any).
export async function getMyCoachProfileAction() {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)

  const profile = await coachProfilesService.getByAppUserId(user.id)
  if (!profile) return { profile: null }

  return { profile: toCoachProfileDTO(profile) }
}

// Create or update the current user's coach profile.
export async function upsertMyCoachProfileAction(body: unknown) {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)

  const data = PatchCoachProfileBodySchema.parse(body)

  if (data.displayName !== undefined) {
    const nextName = data.displayName?.trim() ? data.displayName.trim() : null
    await usersService.updateDisplayNameByClerkUserId(clerkUserId, nextName)
  }

  const profile = await coachProfilesService.upsertByAppUserId(user.id, {
    bio: data.bio ?? null,
    notes: data.notes ?? null,
    zip: data.zip ?? null,
    phone: data.phone ?? null,
  })

  return { profile: toCoachProfileDTO(profile) }
}

// Admin-only: fetch a coach profile by Clerk user id.
export async function getCoachProfileByClerkUserIdAction(clerkUserId: string) {
  const { org } = await authzService.requireAdmin()

  const member = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
  if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found")
  if (member.role !== "COACH") {
    throw new HttpError(400, "NOT_COACH", "Member is not a coach")
  }

  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)
  const profile = await coachProfilesService.getByAppUserId(user.id)

  return { profile: profile ? toCoachProfileDTO(profile) : null }
}

// Admin-only: create or update a coach profile by Clerk user id.
export async function upsertCoachProfileByClerkUserIdAction(
  clerkUserId: string,
  body: unknown
) {
  const { org } = await authzService.requireAdmin()

  const member = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
  if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found")
  if (member.role !== "COACH") {
    throw new HttpError(400, "NOT_COACH", "Member is not a coach")
  }

  const data = PatchCoachProfileBodySchema.parse(body)
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)

  if (data.displayName !== undefined) {
    const nextName = data.displayName?.trim() ? data.displayName.trim() : null
    await usersService.updateDisplayNameByClerkUserId(clerkUserId, nextName)
  }

  const profile = await coachProfilesService.upsertByAppUserId(user.id, {
    bio: data.bio ?? null,
    notes: data.notes ?? null,
    zip: data.zip ?? null,
    phone: data.phone ?? null,
  })

  return { profile: toCoachProfileDTO(profile) }
}
