"use server"

import { revalidatePath } from "next/cache"
import { requireClerkUserId, requireClerkOrgId } from "@/lib/clerk"
import { getOrgOrThrow } from "@/modules/org/org.usecases"
import { inviteMember } from "@/modules/memberships/memberships.usecases"
import { toAppError } from "@/lib/errors"

export async function inviteMemberAction(form: FormData) {
  try {
    await requireClerkUserId()
    const clerkOrgId = await requireClerkOrgId()

    const org = await getOrgOrThrow(clerkOrgId)

    const clerkUserId = (form.get("clerkUserId") as string | null)?.trim()
    const role = ((form.get("role") as string | null) || "COACH").trim() as "ADMIN" | "COACH"

    if (!clerkUserId) {
      return { ok: false, error: { code: "BAD_REQUEST", message: "clerkUserId is required" } }
    }

    const membership = await inviteMember(org.id, clerkUserId, role)

    revalidatePath("/portal/memberships")

    return { ok: true, data: membership }
  } catch (err) {
    const e = toAppError(err)
    return { ok: false, error: { code: e.code, message: e.message } }
  }
}
