// app/portal/layout.tsx
// Portal shell with auth/role guards and org switcher.
import type { ReactNode } from "react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getMembersMe } from "@/app/portal/_lib/members-me"
import AutoSetActiveOrg from "@/app/portal/_components/auto-set-org"

// Always run on the server to check auth and membership.
export const dynamic = "force-dynamic"

// Fetch a small sample to determine if user has any orgs.
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
            <UserButton signInUrl="/sign-in" />
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

    if (me.code === "ORG_NOT_PROVISIONED") {
      return (
        <main className="min-h-screen p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Portal</h1>
            <UserButton />
          </div>

          <div className="mt-10 max-w-xl space-y-2">
            <h2 className="text-lg font-semibold">Organization not provisioned</h2>
            <p className="text-sm text-muted-foreground">
              This organization hasn&apos;t been fully set up yet. Please contact an admin or support.
            </p>
          </div>
        </main>
      )
    }

    if (me.code === "NO_MEMBERSHIP") {
      return (
        <main className="min-h-screen p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Portal</h1>
            <UserButton />
          </div>

          <div className="mt-10 max-w-xl space-y-2">
            <h2 className="text-lg font-semibold">Access not configured</h2>
            <p className="text-sm text-muted-foreground">
              Your account is in this organization, but access hasn&apos;t been configured yet.
              Please contact an admin.
            </p>
          </div>
        </main>
      )
    }

    if (me.code === "MEMBERSHIP_DISABLED" || me.code === "USER_DISABLED") {
      const { userId } = await auth()
      if (!userId) redirect("/sign-in")

      const membershipCount = await getOrgMembershipCount(userId)
      const hasOrgs = membershipCount > 0

      return (
        <main className="min-h-screen p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Portal</h1>
            <div className="flex items-center gap-3">
              {hasOrgs ? (
                <OrganizationSwitcher
                  afterSelectOrganizationUrl="/portal"
                  afterSelectPersonalUrl="/portal"
                  afterCreateOrganizationUrl="/portal"
                  hidePersonal
                />
              ) : null}
              <UserButton signInUrl="/sign-in" />
            </div>
          </div>

          <div className="mt-10 max-w-xl space-y-2">
            <h2 className="text-lg font-semibold">Access disabled</h2>
            <p className="text-sm text-muted-foreground">
              Your access to this organization is disabled. Please contact an admin.
            </p>
          </div>
        </main>
      )
    }

    throw new Error(me.message)
  }

  const { userId } = await auth()
  const membershipCount = userId ? await getOrgMembershipCount(userId) : 0
  const showOrgSwitcher = membershipCount > 0

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
          <UserButton signInUrl="/sign-in" />
        </div>
      </div>
      <AutoSetActiveOrg />
      <div className="mt-6">{children}</div>
    </main>
  )
}
