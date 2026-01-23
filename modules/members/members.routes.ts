// modules/members/members.routes.ts
import "server-only"

import type { NextRequest } from "next/server"
import { jsonError } from "@/lib/errors"
import {
  listMembersAction,
  getMeAction,
  getMemberByClerkUserIdAction,
  patchMemberByClerkUserIdAction,
} from "./members.actions"

type Ctx<P> = { params: P | Promise<P> }

// GET /api/members
export const GET_members = async (request: NextRequest) => {
  try {
    const dto = await listMembersAction(request)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonError(err)
  }
}

// GET /api/members/me
export const GET_me = async () => {
  try {
    const dto = await getMeAction()
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonError(err)
  }
}

// GET /api/members/[clerkUserId]
export const GET_byClerkUserId = async (_request: NextRequest, ctx: Ctx<{ clerkUserId: string }>) => {
  try {
    const { clerkUserId } = await ctx.params
    const dto = await getMemberByClerkUserIdAction(clerkUserId)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonError(err)
  }
}

// PATCH /api/members/[clerkUserId]
export const PATCH_byClerkUserId = async (
  request: NextRequest,
  ctx: Ctx<{ clerkUserId: string }>
) => {
  try {
    const { clerkUserId } = await ctx.params
    const body = await request.json()
    const dto = await patchMemberByClerkUserIdAction(clerkUserId, body)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonError(err)
  }
}
