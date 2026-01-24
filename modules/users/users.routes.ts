// modules/users/users.routes.ts
// Thin HTTP layer for user endpoints.
import "server-only"

import { jsonErrorResponse } from "@/modules/_shared/errors"
import { getMyUserAction } from "@/modules/users/users.actions"

// Route handlers exported to app/api.
export const usersRoutes = {
  // GET /api/users/me
  async me() {
    try {
      const dto = await getMyUserAction()
      return Response.json({ ok: true, ...dto })
    } catch (err) {
      return jsonErrorResponse(err)
    }
  },
}
