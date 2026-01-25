// modules/debug/invites.routes.ts
// Debug endpoint for Clerk org invites.
import "server-only"

import type { NextRequest } from "next/server"
import { jsonErrorResponse } from "@/modules/_shared/errors"
import { listClerkOrgInvitesAction } from "@/modules/debug/debug.actions"

// GET /api/debug/clerk-org-invites?orgId=org_...
export const GET_clerkOrgInvites = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId") ?? ""
    const dto = await listClerkOrgInvitesAction(orgId)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}
