// components/shell/portal-nav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  href: string
  label: string
}

const NAV: NavItem[] = [
  { href: "/portal", label: "Home" },
  { href: "/portal/admin", label: "Admin" },
  { href: "/portal/coach", label: "Coach" },
]

function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal"
  return pathname === href || pathname.startsWith(href + "/")
}

export function PortalNav() {
  const pathname = usePathname()

  return (
    <nav className="rounded-xl border bg-card p-2">
      <div className="px-2 py-2 text-xs font-medium text-muted-foreground">Navigation</div>
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent/60",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
