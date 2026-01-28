// app/portal/_components/portal-gate.tsx
"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { PortalShell } from "@/components/shell/portal-shell"
import { useBootstrap } from "@/components/shell/bootstrap-provider"

type PortalGateProps = {
  children: ReactNode
}

export function PortalGate({ children }: PortalGateProps) {
  const boot = useBootstrap()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (boot.loading || !boot.data) return

    if (!boot.data.signedIn) {
      router.replace("/sign-in")
      return
    }

    if (!boot.data.activeOrg) {
      router.replace("/session/org-select")
      return
    }
  }, [boot.loading, boot.data, router, pathname])

  if (boot.loading || !boot.data) return null

  return <PortalShell>{children}</PortalShell>
}
