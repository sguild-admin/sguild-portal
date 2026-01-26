// components/shell/portal-shell.tsx
import type { ReactNode } from "react"
import { PortalHeader } from "./portal-header"
import { PortalNav } from "./portal-nav"

type PortalShellProps = {
  children: ReactNode
}

export function PortalShell({ children }: PortalShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PortalHeader />

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <PortalNav />
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
