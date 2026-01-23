// modules/org/org.routes.ts
import "server-only"

import { authzService, HttpError } from "@/modules/authz/authz.service"
import { orgService } from "@/modules/org/org.service"
import { jsonError } from "@/lib/errors"

function requireBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Body must be a JSON object")
  }
  return body as Record<string, unknown>
}

export const orgRoutes = {
  // GET /api/org/me
  async me() {
    try {
      const access = await authzService.requireOrgAccess({ allowSuperAdmin: true })

      return Response.json({
        ok: true,
        mode: access.mode,
        org: access.org,
        membership: access.membership,
      })
    } catch (err) {
      return jsonError(err)
    }
  },

  // PATCH /api/org/primary-admin
  // body: { clerkUserId: string | null }
  async setPrimaryAdmin(request: Request) {
    try {
      const { org } = await authzService.requireAdmin()

      const raw = requireBodyObject(await request.json())
      const clerkUserId =
        raw.clerkUserId === null
          ? null
          : typeof raw.clerkUserId === "string"
            ? raw.clerkUserId
            : undefined

      if (clerkUserId === undefined) {
        throw new HttpError(400, "INVALID_CLERK_USER_ID", "clerkUserId must be a string or null")
      }

      const updated = await orgService.setPrimaryAdmin(org.id, clerkUserId)
      return Response.json({ ok: true, org: updated })
    } catch (err) {
      return jsonError(err)
    }
  },
}
