// modules/coachProfiles/coachProfiles.routes.ts
// Thin HTTP layer for coach profile endpoints.
import "server-only"

import type { NextRequest } from "next/server"
import { jsonErrorResponse } from "@/modules/_shared/errors"
import {
  getMyCoachProfileAction,
  upsertMyCoachProfileAction,
  getCoachProfileByClerkUserIdAction,
  upsertCoachProfileByClerkUserIdAction,
} from "@/modules/coachProfiles/coachProfiles.actions"

type Ctx<P> = { params: P | Promise<P> }

// GET /api/coach-profiles/me
export const GET_me = async () => {
  try {
    const dto = await getMyCoachProfileAction()
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// PATCH /api/coach-profiles/me
export const PATCH_me = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const dto = await upsertMyCoachProfileAction(body)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// GET /api/coach-profiles/[clerkUserId]
export const GET_byClerkUserId = async (
  _request: NextRequest,
  ctx: Ctx<{ clerkUserId: string }>
) => {
  try {
    const { clerkUserId } = await ctx.params
    const dto = await getCoachProfileByClerkUserIdAction(clerkUserId)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// PATCH /api/coach-profiles/[clerkUserId]
export const PATCH_byClerkUserId = async (
  request: NextRequest,
  ctx: Ctx<{ clerkUserId: string }>
) => {
  try {
    const { clerkUserId } = await ctx.params
    const body = await request.json()
    const dto = await upsertCoachProfileByClerkUserIdAction(clerkUserId, body)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}
