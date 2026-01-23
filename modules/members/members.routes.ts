// modules/members/members.routes.ts
import "server-only"

import type { NextRequest } from "next/server"
import { OrgRole, MembershipStatus } from "@prisma/client"
import { authzService, HttpError } from "@/modules/authz/authz.service"
import { membersService } from "@/modules/members/members.service"
import { jsonError } from "@/lib/errors"

type Ctx<P> = { params: P | Promise<P> }

function parseIntParam(v: string | null, fallback: number) {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

function parseEnum<T extends Record<string, string>>(
  e: T,
  v: string | null
): T[keyof T] | undefined {
  if (!v) return undefined
  const values = Object.values(e)
  return values.includes(v) ? (v as T[keyof T]) : undefined
}

function requireBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Body must be a JSON object")
  }
  return body as Record<string, unknown>
}

// GET /api/members
export const GET_members = async (request: NextRequest) => {
  try {
    const { org } = await authzService.requireAdmin()

    const url = new URL(request.url)
    const role = parseEnum(OrgRole, url.searchParams.get("role"))
    const status = parseEnum(MembershipStatus, url.searchParams.get("status"))
    const take = Math.min(parseIntParam(url.searchParams.get("take"), 100), 200)
    const skip = Math.max(parseIntParam(url.searchParams.get("skip"), 0), 0)

    const members = await membersService.listByOrg(org.id, { role, status, take, skip })
    return Response.json({ ok: true, members })
  } catch (err) {
    return jsonError(err)
  }
}

// GET /api/members/me
export const GET_me = async () => {
  try {
    const access = await authzService.requireOrgAccess({ allowSuperAdmin: true })
    return Response.json({
      ok: true,
      org: { id: access.org.id, clerkOrgId: access.org.clerkOrgId, name: access.org.name },
      mode: access.mode,
      membership: access.membership,
    })
  } catch (err) {
    return jsonError(err)
  }
}

// GET /api/members/[clerkUserId]
export const GET_byClerkUserId = async (request: NextRequest, ctx: Ctx<{ clerkUserId: string }>) => {
  try {
    const { org } = await authzService.requireAdmin()
    const { clerkUserId } = await ctx.params

    const member = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
    if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found")

    return Response.json({ ok: true, member })
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
    const { org } = await authzService.requireAdmin()
    const { clerkUserId } = await ctx.params

    const raw = requireBodyObject(await request.json())
    const role = parseEnum(OrgRole, typeof raw.role === "string" ? raw.role : null)
    const status = parseEnum(MembershipStatus, typeof raw.status === "string" ? raw.status : null)

    if (!role && !status) throw new HttpError(400, "NO_CHANGES", "Provide role and or status")

    let updated = await membersService.getByOrgAndClerkUserId(org.id, clerkUserId)
    if (!updated) throw new HttpError(404, "NOT_FOUND", "Member not found")

    if (role) updated = await membersService.setRole(org.id, clerkUserId, role)

    if (status) {
      const now = new Date()
      const timestamps =
        status === MembershipStatus.INVITED
          ? { invitedAt: now, disabledAt: null }
          : status === MembershipStatus.ACTIVE
            ? { activatedAt: now, disabledAt: null }
            : { disabledAt: now }

      updated = await membersService.setStatus(org.id, clerkUserId, status, timestamps)
    }

    return Response.json({ ok: true, member: updated })
  } catch (err) {
    return jsonError(err)
  }
}
