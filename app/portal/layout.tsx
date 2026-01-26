import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { PortalShell } from "@/components/shell/portal-shell"
import { BootstrapProvider } from "@/components/shell/bootstrap-provider"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const result = await auth.api.getSession({ headers: h })
  if (!result?.session) redirect("/sign-in")

  return (
    <BootstrapProvider>
      <PortalShell>{children}</PortalShell>
    </BootstrapProvider>
  )
}
