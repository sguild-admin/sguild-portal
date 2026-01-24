// app/portal/coach/layout.tsx
// Coach portal access guard.
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getMembersMe } from "@/app/portal/_lib/members-me"

// Always evaluate on the server for auth checks.
export const dynamic = "force-dynamic"

export default async function CoachLayout({ children }: { children: ReactNode }) {
  const me = await getMembersMe()

  if (!me.ok) {
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")
    if (me.code === "NO_ACTIVE_ORG") redirect("/portal")
    throw new Error(me.message)
  }

  if (me.membership?.role !== "COACH") {
    return (
      <main className="min-h-screen p-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Forbidden</h1>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have access to the coach portal.
          </p>
        </div>
      </main>
    )
  }

  return children
}
