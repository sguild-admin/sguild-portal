// app/portal/coach/layout.tsx
// Coach portal access guard.
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { PageHeader } from "@/app/portal/_components/PageHeader"
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

export default async function CoachLayout({ children }: { children: ReactNode }) {
  const me = await getMembersMeSafe()

  if (!me.ok) {
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")
    if (me.code === "NO_ACTIVE_ORG") redirect("/portal/select-org")
    const title =
      me.code === "MEMBERSHIP_DISABLED" || me.code === "USER_DISABLED"
        ? "Access disabled"
        : me.code === "NO_MEMBERSHIP"
          ? "Access pending"
          : me.code === "ORG_NOT_PROVISIONED"
            ? "Organization not provisioned"
            : "Access restricted"

    const subtitle =
      me.code === "MEMBERSHIP_DISABLED" || me.code === "USER_DISABLED"
        ? "Your access to this organization is disabled."
        : me.code === "NO_MEMBERSHIP"
          ? "Your account isn’t configured for this organization yet."
          : me.code === "ORG_NOT_PROVISIONED"
            ? "This organization hasn’t been set up yet."
            : "You don’t have access to this portal."

    return (
      <div className="space-y-4">
        <PageHeader title={title} subtitle={subtitle} />
        <div className="app-card max-w-xl p-6 text-sm text-slate-600">
          Please contact your organization administrator if you believe this is an error.
        </div>
      </div>
    )
  }

  if (me.membership?.role !== "COACH") {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Forbidden"
          subtitle="You don’t have access to the coach portal for this organization."
        />
        <div className="app-card max-w-xl p-6 text-sm text-slate-600">
          If you need coach access, contact your organization administrator.
        </div>
      </div>
    )
  }

  return children
}
