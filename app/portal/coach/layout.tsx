import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getMembersMe } from "@/app/portal/_lib/members-me"

export const dynamic = "force-dynamic"

export default async function CoachLayout({ children }: { children: ReactNode }) {
  const me = await getMembersMe()

  if (!me.ok) {
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")
    if (me.code === "NO_ACTIVE_ORG") redirect("/portal")
    throw new Error(me.message)
  }

  if (me.membership?.role === "ADMIN") {
    redirect("/portal/admin")
  }

  if (me.membership?.role !== "COACH") {
    redirect("/portal")
  }

  return children
}
