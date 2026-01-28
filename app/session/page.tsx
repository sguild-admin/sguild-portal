// app/session/page.tsx
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { getRequestHeaders } from "@/lib/auth/next-request-headers"

export default async function SessionPage() {
  const reqHeaders = await getRequestHeaders()
  const session = await auth.api.getSession({ headers: reqHeaders })

  if (!session?.user) redirect("/sign-in")

  const superAdmin = await prisma.superAdmin.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (superAdmin) redirect("/superadmin")

  const activeOrgId = session.session?.activeOrganizationId ?? null
  if (activeOrgId) redirect("/portal")

  const orgs = await auth.api.listOrganizations({ headers: reqHeaders })
  if (!orgs || orgs.length === 0) redirect("/session/no-access")

  redirect("/session/org-select")
}
