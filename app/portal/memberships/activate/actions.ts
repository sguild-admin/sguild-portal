"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId, requireClerkOrgId } from "@/lib/clerk"
import { requireOrgAdmin } from "@/modules/auth/auth.usecases"
import { activateMember } from "@/modules/memberships/memberships.usecases"
import { toAppError } from "@/lib/errors"

export async function activateMemberAction(membershipId: string) {
  try {
    const requester = await requireClerkUserId()
    const clerkOrgId = await requireClerkOrgId()

    // ensure requester is an org admin
    await requireOrgAdmin(requester, clerkOrgId)

    const result = await activateMember(membershipId)

    revalidatePath("/portal/memberships")

    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
