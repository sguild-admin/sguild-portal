// components/shell/portal-header.tsx
import Image from "next/image"
import Link from "next/link"

export function PortalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/portal" className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="Sguild" width={22} height={22} />
          <span className="text-sm font-semibold tracking-tight">Sguild Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* placeholder for org switcher and user menu */}
          <span className="text-xs text-muted-foreground">Signed in</span>
        </div>
      </div>
    </header>
  )
}
