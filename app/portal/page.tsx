// app/portal/page.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"

export default async function PortalHomePage() {
  const h = await headers()
  const result = await auth.api.getSession({ headers: h })

  if (!result?.session) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Portal</h1>
      <p className="text-sm text-muted-foreground">Select a section from the navigation</p>
    </div>
  )
}
