"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId } from "@/lib/clerk"
import { buildActor } from "@/modules/auth/auth.usecases"
import { assignOrgAdmin } from "@/modules/superAdmin/superAdmin.usecases"
import { toAppError } from "@/lib/errors"

export async function assignOrgAdminAction(form: FormData) {
  try {
    const requester = await requireClerkUserId()
    const actor = await buildActor(requester)

    const orgId = (form.get("orgId") as string | null)?.trim()
    const clerkUserId = (form.get("clerkUserId") as string | null)?.trim()

    if (!orgId || !clerkUserId) return { ok: false, error: { code: "BAD_REQUEST", message: "orgId and clerkUserId are required" } }

    const result = await assignOrgAdmin(actor, { orgId, clerkUserId })

    revalidatePath("/portal/super-admin/orgs")

    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
