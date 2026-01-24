// modules/orgInvites/orgInvites.routes.ts
// Thin HTTP layer for org invite endpoints.
import "server-only"

import type { NextRequest } from "next/server"
import { jsonErrorResponse } from "@/modules/_shared/errors"
import {
  listOrgInvitesAction,
  getOrgInviteByIdAction,
  createOrgInviteAction,
  revokeOrgInviteAction,
  resendOrgInviteAction,
} from "@/modules/orgInvites/orgInvites.actions"

// Next.js route context type helper.
type Ctx<P> = { params: P | Promise<P> }

// GET /api/org-invites
export const GET_orgInvites = async (request: NextRequest) => {
  try {
    const dto = await listOrgInvitesAction(request)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// POST /api/org-invites
export const POST_orgInvites = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const dto = await createOrgInviteAction(body)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// GET /api/org-invites/[inviteId]
export const GET_byId = async (_request: NextRequest, ctx: Ctx<{ inviteId: string }>) => {
  try {
    const { inviteId } = await ctx.params
    const dto = await getOrgInviteByIdAction(inviteId)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// PATCH /api/org-invites/[inviteId]
export const PATCH_byId = async (request: NextRequest, ctx: Ctx<{ inviteId: string }>) => {
  try {
    const { inviteId } = await ctx.params
    const body = await request.json()
    const dto = await revokeOrgInviteAction(inviteId, body)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

// POST /api/org-invites/[inviteId]/resend
export const POST_resend = async (_request: NextRequest, ctx: Ctx<{ inviteId: string }>) => {
  try {
    const { inviteId } = await ctx.params
    const dto = await resendOrgInviteAction(inviteId)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}
