"use client"

import Image from "next/image"
import Link from "next/link"
import { useBootstrap } from "./bootstrap-provider"

export function PortalHeader() {
  const { data, loading } = useBootstrap()

  const orgName = loading
    ? "Loading"
    : data?.activeOrg?.name ?? "No active org"

  const roles = data?.roles ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/portal" className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="Sguild" width={22} height={22} />
          <span className="text-sm font-semibold tracking-tight">Sguild Portal</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{orgName}</span>
          {roles.length ? (
            <span className="text-xs text-muted-foreground">{roles.join(", ")}</span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
