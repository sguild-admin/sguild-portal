// modules/users/users.routes.ts
import "server-only"

import { jsonError } from "@/lib/errors"
import { getMyUserAction } from "@/modules/users/users.actions"

export const usersRoutes = {
  // GET /api/users/me
  async me() {
    try {
      const dto = await getMyUserAction()
      return Response.json({ ok: true, ...dto })
    } catch (err) {
      return jsonError(err)
    }
  },
}
