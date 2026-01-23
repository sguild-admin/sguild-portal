import { redirect } from "next/navigation"
import { getMembersMe } from "@/app/portal/_lib/members-me"

export default async function Page() {
  const me = await getMembersMe()

  if (!me.ok) {
    if (me.code === "NO_ACTIVE_ORG") return null
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")

    throw new Error(me.message)
  }

  if (me.membership?.role === "ADMIN") {
    redirect("/portal/admin")
  }

  redirect("/portal/coach")
}
