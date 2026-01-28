// app/superadmin/layout.tsx
import type { ReactNode } from "react"
import { requireSuperAdminOrRedirect } from "@/lib/auth/redirects"
import { BootstrapProvider } from "@/components/shell/bootstrap-provider"
import { SuperAdminBanner } from "./_components/superadmin-banner"

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  await requireSuperAdminOrRedirect("/session")
  return (
    <BootstrapProvider>
      <div className="min-h-dvh bg-muted/30 dark:bg-background">
        <SuperAdminBanner />
        <div>{children}</div>
      </div>
    </BootstrapProvider>
  )
}
