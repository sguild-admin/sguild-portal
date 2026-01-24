import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AppBar } from "@/app/portal/_components/AppBar"
import { ContentContainer } from "@/app/portal/_components/ContentContainer"
import { PageHeader } from "@/app/portal/_components/PageHeader"
import OrgChangeRefresh from "@/app/portal/_components/org-change-refresh"
import { membersActions } from "@/modules/members"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const me = await membersActions.getMeAction()

  if (!me.ok) {
    if (me.code === "UNAUTHENTICATED") redirect("/sign-in")
    if (me.code === "NO_ACTIVE_ORG") {
      return (
        <>
          <AppBar />
          <main id="content">
            <ContentContainer>{children}</ContentContainer>
          </main>
        </>
      )
    }
    const errorTitle =
      me.code === "ORG_NOT_PROVISIONED"
        ? "Organization not provisioned"
        : me.code === "NO_MEMBERSHIP"
          ? "Access pending"
          : me.code === "MEMBERSHIP_DISABLED" || me.code === "USER_DISABLED"
            ? "Access disabled"
            : "Access restricted"

    const errorMessage =
      me.code === "ORG_NOT_PROVISIONED"
        ? "This organization hasn’t been set up yet. Contact an admin or support."
        : me.code === "NO_MEMBERSHIP"
          ? "Your account isn’t configured for this organization yet. Contact an admin."
          : me.code === "MEMBERSHIP_DISABLED" || me.code === "USER_DISABLED"
            ? "Your access to this organization is disabled. Contact an admin."
            : "You don’t have access to this portal."

    return (
      <>
        <AppBar />
        <main id="content">
          <ContentContainer>
            <PageHeader title={errorTitle} subtitle={errorMessage} />
            <div className="app-card max-w-xl p-6 text-sm text-slate-600">
              Please contact your organization administrator if you believe this is an error.
            </div>
          </ContentContainer>
        </main>
      </>
    )
  }

  return (
    <>
      <AppBar />
      <main id="content">
        <ContentContainer>{children}</ContentContainer>
      </main>
      <OrgChangeRefresh />
    </>
  )
}
