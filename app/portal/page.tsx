// app/portal/page.tsx
// Redirect users to the right portal based on membership role.
import { redirect } from "next/navigation"
import { unknownToAppError } from "@/modules/_shared/errors"
import { getMeAction } from "@/modules/members"

// Always evaluate on the server for auth checks.
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

async function getMembersMeSafe() {
  try {
    const dto = await getMeAction()
    return { ok: true as const, ...dto }
  } catch (err) {
    const e = unknownToAppError(err)
    return { ok: false as const, code: e.code, message: e.message }
  }
}

export default async function Page() {
  const me = await getMembersMeSafe()

  if (!me.ok) {
    if (me.code === "NO_ACTIVE_ORG") redirect("/portal/select-org")
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")
    return null
  }

  if (me.membership?.role === "ADMIN") {
    redirect("/portal/admin")
  }

  if (me.membership?.role === "COACH") {
    redirect("/portal/coach")
  }

  redirect("/portal")
}
