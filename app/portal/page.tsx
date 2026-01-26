// app/portal/page.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/auth"

export default async function PortalIndexPage() {
  const h = await headers()






  const sessionRes = await auth.api.getSession({ headers: h })
  if (!sessionRes?.session) redirect("/sign-in")

  // Optionally, fetch roles and org info here if needed, or just redirect to a default
  const orgId = sessionRes.session.activeOrganizationId ?? null
  if (!orgId) redirect("/portal/orgs")

  // You may want to fetch roles here if you need to route by role
  // For now, just redirect to admin or coach as a fallback
  // TODO: If you want role-based routing, fetch and check roles here
  redirect("/portal/admin")
}
