// app/portal/page.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type Bootstrap = {
  signedIn: boolean
  isSuperAdmin?: boolean
  session: { activeOrganizationId: string | null } | null
  roles: string[]
}

export default async function PortalIndexPage() {
  const h = await headers()

  const res = await fetch("/api/bootstrap", {
    headers: h as any,
    cache: "no-store",
  })

  const json = (await res.json()) as { ok: true; data: Bootstrap }
  const b = json.data

  if (!b.signedIn) redirect("/sign-in")
  if (b.isSuperAdmin) redirect("/portal/super-admin")

  const orgId = b.session?.activeOrganizationId ?? null
  if (!orgId) redirect("/portal/orgs")

  if (b.roles.includes("owner") || b.roles.includes("admin")) redirect("/portal/admin")
  if (b.roles.includes("member")) redirect("/portal/coach")

  redirect("/portal/orgs")
}
