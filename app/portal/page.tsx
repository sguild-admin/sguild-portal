import { redirect } from "next/navigation"
import { getMembersMe } from "@/app/portal/_lib/members-me"

export const dynamic = "force-dynamic"

export default async function Page() {
  const me = await getMembersMe()

  if (!me.ok) {
    if (me.code === "NO_ACTIVE_ORG") return null
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")
    if (me.code === "MEMBERSHIP_DISABLED" || me.code === "USER_DISABLED") return null

    throw new Error(me.message)
  }

  if (me.membership?.role === "ADMIN") {
    redirect("/portal/admin")
  }

  if (me.membership?.role === "COACH") {
    redirect("/portal/coach")
  }

  redirect("/portal")
}
