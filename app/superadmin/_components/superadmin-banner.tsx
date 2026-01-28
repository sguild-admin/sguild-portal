"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"

export function SuperAdminBanner() {
  const router = useRouter()

  async function onSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in")
          router.refresh()
        },
      },
    })
  }

  return (
    <div className="border-b border-border/60 bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-medium">Super Admin</div>
          <div className="text-xs text-muted-foreground">Manage organizations and admins</div>
        </div>

        <Button variant="outline" size="sm" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
