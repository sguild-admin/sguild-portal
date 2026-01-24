import "server-only"

import type { NextRequest } from "next/server"
import { jsonErrorResponse } from "@/modules/_shared/errors"
import { getMyCoachProfileAction, upsertMyCoachProfileAction } from "@/modules/coachProfiles/coachProfiles.actions"

export const GET_me = async () => {
  try {
    const dto = await getMyCoachProfileAction()
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}

export const PATCH_me = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const dto = await upsertMyCoachProfileAction(body)
    return Response.json({ ok: true, ...dto })
  } catch (err) {
    return jsonErrorResponse(err)
  }
}
