// modules/org/org.routes.ts
// Thin HTTP layer: parse Request, call actions, return JSON.
import "server-only"

import { jsonErrorResponse } from "@/modules/_shared/errors"
import { getMyOrgAction, setPrimaryAdminAction } from "./org.actions"

// Route handlers exported to app/api.
export const orgRoutes = {
  // GET /api/org/me
  async me() {
    try {
      const dto = await getMyOrgAction()
      return Response.json({ ok: true, ...dto })
    } catch (err) {
      return jsonErrorResponse(err)
    }
  },

  // PATCH /api/org/primary-admin
  async setPrimaryAdmin(request: Request) {
    try {
      const body = await request.json()
      const dto = await setPrimaryAdminAction(body)
      return Response.json({ ok: true, ...dto })
    } catch (err) {
      return jsonErrorResponse(err)
    }
  },
}
