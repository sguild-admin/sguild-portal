// modules/debug/debug.routes.ts
// Thin HTTP layer for debug endpoints.
import "server-only"

import type { NextRequest } from "next/server"
import { jsonErrorResponse } from "@/modules/_shared/errors"
import { checkClerkOrgAction } from "@/modules/debug/debug.actions"

// GET /api/debug/clerk-org?orgId=org_...
export const GET_clerkOrg = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId") ?? ""
    const dto = await checkClerkOrgAction(orgId)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}
