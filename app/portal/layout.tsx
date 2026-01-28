// app/portal/layout.tsx
import type { ReactNode } from "react"
import { requireActiveOrgOrRedirect } from "@/lib/auth/redirects"
import { BootstrapProvider } from "@/components/shell/bootstrap-provider"
import { PortalShell } from "@/components/shell/portal-shell"

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireActiveOrgOrRedirect("/session/org-select")

  return (
    <BootstrapProvider>
      <PortalShell>{children}</PortalShell>
    </BootstrapProvider>
  )
}
