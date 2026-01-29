"use client"

import { SignOutButton } from "@/components/common/sign-out-button"

export function SuperAdminBanner() {
  return (
    <div className="border-b border-border/60 bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-medium">Super Admin</div>
          <div className="text-xs text-muted-foreground">Manage organizations and admins</div>
        </div>

        <SignOutButton variant="outline" size="sm" redirectMethod="push">
          Sign out
        </SignOutButton>
      </div>
    </div>
  )
}
