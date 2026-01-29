"use server"

import { headers } from "next/headers"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { coachProfilesRepo } from "./coach-profiles.repo"
import { UpsertCoachProfileSchema, SetCoachStatusSchema } from "./coach-profiles.schema"
import { toCoachProfileDto } from "./coach-profiles.dto"

export async function listCoachProfilesAction() {
  const hdrs = await headers()
  await requireAdminOrOwner(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const rows = await coachProfilesRepo.listByOrg(orgId)
  return rows.map((r) => toCoachProfileDto(r as any))
}

export async function getMyCoachProfileAction() {
  const hdrs = await headers()
  const session = await requireSession(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const userId = session.userId
  const row = await coachProfilesRepo.getByOrgUser(orgId, userId)
  return row ? toCoachProfileDto(row as any) : null
}

export async function upsertMyCoachProfileAction(input: unknown) {
  const hdrs = await headers()
  const session = await requireSession(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const userId = session.userId
  const data = UpsertCoachProfileSchema.parse(input)
  const row = await coachProfilesRepo.upsert(orgId, userId, data)
  return toCoachProfileDto(row as any)
}

export async function setCoachStatusAction(input: unknown) {
  const hdrs = await headers()
  await requireAdminOrOwner(hdrs)
  const orgId = await requireActiveOrgId(hdrs)
  const data = SetCoachStatusSchema.parse(input)
  const row = await coachProfilesRepo.setStatus(orgId, data.userId, data.status)
  return toCoachProfileDto(row as any)
}
