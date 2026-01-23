"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId } from "@/lib/clerk"
import { buildActor } from "@/modules/auth/auth.usecases"
import { setSuperAdmin } from "@/modules/superAdmin/superAdmin.usecases"
import { toAppError } from "@/lib/errors"

export async function setSuperAdminAction(form: FormData) {
  try {
    const requester = await requireClerkUserId()
    const actor = await buildActor(requester)

    const clerkUserId = (form.get("clerkUserId") as string | null)?.trim()
    const isSuperAdminRaw = (form.get("isSuperAdmin") as string | null) ?? "false"
    const isSuperAdmin = isSuperAdminRaw === "true"

    if (!clerkUserId) return { ok: false, error: { code: "BAD_REQUEST", message: "clerkUserId required" } }

    const result = await setSuperAdmin(actor, { clerkUserId, isSuperAdmin })

    revalidatePath("/portal/super-admin/users")

    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
