"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId, requireClerkOrgId } from "@/lib/clerk"
import { buildActor } from "@/modules/auth/auth.usecases"
import { inviteCoach, disableCoach } from "@/modules/coaches/coaches.usecases"
import { toAppError } from "@/lib/errors"

export async function inviteCoachAction(form: FormData) {
  try {
    const requester = await requireClerkUserId()
    const clerkOrgId = await requireClerkOrgId()
    const actor = await buildActor(requester)

    const email = (form.get("email") as string | null)?.trim()
    if (!email) return { ok: false, error: { code: "BAD_REQUEST", message: "email is required" } }

    const result = await inviteCoach(actor, { clerkOrgId, email })

    revalidatePath("/portal/admin/coaches")
    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}

export async function disableCoachAction(form: FormData) {
  try {
    const requester = await requireClerkUserId()
    const clerkOrgId = await requireClerkOrgId()
    const actor = await buildActor(requester)

    const coachId = (form.get("coachId") as string | null)?.trim()
    if (!coachId) return { ok: false, error: { code: "BAD_REQUEST", message: "coachId is required" } }

    const result = await disableCoach(actor, { clerkOrgId, coachId })

    revalidatePath("/portal/admin/coaches")
    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
