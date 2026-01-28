// app/session/layout.tsx
import type { ReactNode } from "react"

import { requireSessionOrRedirect } from "@/lib/auth/redirects"
import { BootstrapProvider } from "@/components/shell/bootstrap-provider"

export default async function SessionLayout({ children }: { children: ReactNode }) {
  await requireSessionOrRedirect("/sign-in")
  return <BootstrapProvider>{children}</BootstrapProvider>
}
