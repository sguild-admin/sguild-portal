"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId } from "@/lib/clerk"
import { requireSuperAdmin } from "@/modules/auth/auth.usecases"
import { toggleSuperAdmin } from "@/modules/superAdmin/superAdmin.usecases"
import { toAppError } from "@/lib/errors"

export async function toggleSuperAdminAction(targetClerkUserId: string, enable: boolean) {
  try {
    const requester = await requireClerkUserId()

    // ensure requester is a super admin
    await requireSuperAdmin(requester)

    const result = await toggleSuperAdmin(targetClerkUserId, enable)

    revalidatePath("/portal/admin")

    return { ok: true, data: result }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
