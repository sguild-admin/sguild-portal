"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId, requireClerkOrgId } from "@/lib/clerk"
import { buildActor } from "@/modules/auth/auth.usecases"
import { updateOrgSettings } from "@/modules/settings/settings.usecases"
import { toAppError } from "@/lib/errors"

export async function updateOrgSettingsAction(form: FormData) {
  try {
    const requester = await requireClerkUserId()
    const clerkOrgId = await requireClerkOrgId()

    const actor = await buildActor(requester)

    const timeZone = (form.get("timeZone") as string | null)?.trim() ?? undefined
    const oceanLessonsRaw = (form.get("oceanLessons") as string | null) ?? undefined
    const oceanLessons = oceanLessonsRaw === undefined ? undefined : oceanLessonsRaw === "true"

    const result = await updateOrgSettings(actor, { clerkOrgId, timeZone, oceanLessons })

    revalidatePath("/portal/admin/settings")

    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
