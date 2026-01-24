// app/portal/_lib/members-me.ts
import { getMeAction } from "@/modules/members"
import { unknownToAppError } from "@/modules/_shared/errors"

export type MembersMeOk = {
  ok: true
  org: { id: string; clerkOrgId: string; name: string }
  membership: { role: string; status?: string }
}

export type MembersMeError = {
  ok: false
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  details?: unknown
  requestId?: string
}

export type MembersMeResponse = MembersMeOk | MembersMeError

export async function getMembersMe(): Promise<MembersMeResponse> {
  try {
    const dto = await getMeAction()
    return { ok: true, ...dto }
  } catch (err) {
    const e = unknownToAppError(err)
    return {
      ok: false,
      code: e.code,
      message: e.message,
      fieldErrors: e.fieldErrors,
      details: e.details,
    }
  }
}
