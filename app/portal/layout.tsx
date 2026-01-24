import type { ReactNode } from "react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getMembersMe } from "@/app/portal/_lib/members-me"
import AutoSetActiveOrg from "@/app/portal/_components/auto-set-org"

export const dynamic = "force-dynamic"

async function getOrgMembershipCount(userId: string) {
  const client = await clerkClient()
  const memberships = await client.users.getOrganizationMembershipList({
    userId,
    limit: 2,
  })
  return memberships.data.length
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const me = await getMembersMe()

  if (!me.ok) {
    if (me.code === "UNAUTHENTICATED") {
      redirect("/sign-in")
    }

    if (me.code === "NO_ACTIVE_ORG") {
      const { userId } = await auth()
      if (!userId) redirect("/sign-in")

      const membershipCount = await getOrgMembershipCount(userId)
      const hasOrgs = membershipCount > 0

      return (
        <main className="min-h-screen p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Portal</h1>
            <UserButton />
          </div>

          <div className="mt-10 max-w-xl space-y-4">
            <AutoSetActiveOrg />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                {hasOrgs ? "Select an organization to continue" : "No organization assigned"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasOrgs
                  ? "Choose an organization from the switcher below."
                  : "Ask an admin to invite you to an organization."}
              </p>
            </div>
            <OrganizationSwitcher
              afterSelectOrganizationUrl="/portal"
              afterSelectPersonalUrl="/portal"
              afterCreateOrganizationUrl="/portal"
              hidePersonal
            />
          </div>
        </main>
      )
    }

    throw new Error(me.message)
  }

  const { userId } = await auth()
  const membershipCount = userId ? await getOrgMembershipCount(userId) : 0
  const showOrgSwitcher = membershipCount > 1

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Portal</h1>
        <div className="flex items-center gap-3">
          {showOrgSwitcher ? (
            <OrganizationSwitcher
              afterSelectOrganizationUrl="/portal"
              afterSelectPersonalUrl="/portal"
              afterCreateOrganizationUrl="/portal"
              hidePersonal
            />
          ) : null}
          <UserButton />
        </div>
      </div>
      <AutoSetActiveOrg />
      <div className="mt-6">{children}</div>
    </main>
  )
}
