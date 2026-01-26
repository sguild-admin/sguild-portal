import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/auth/guards"

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const h = await headers()
    await requireSuperAdmin(h)
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === "UNAUTHENTICATED") redirect("/sign-in")
    redirect("/portal")
  }

  return <>{children}</>
}
