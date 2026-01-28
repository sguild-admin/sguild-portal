"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBootstrap } from "./bootstrap-provider"

type NavItem = {
  href: string
  label: string
  allow: (roles: string[], superAdmin: boolean) => boolean
}

const NAV: NavItem[] = [
  { href: "/portal", label: "Home", allow: () => true },
  { href: "/superadmin", label: "Super Admin", allow: (_r, sa) => sa },
  { href: "/portal/admin", label: "Admin", allow: (r) => r.includes("owner") || r.includes("admin") },
  { href: "/portal/coach", label: "Coach", allow: (r) => r.includes("member") || r.includes("owner") || r.includes("admin") },
]

function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal"
  return pathname === href || pathname.startsWith(href + "/")
}

export function PortalNav() {
  const pathname = usePathname()
  const { data, loading } = useBootstrap()

  const roles = !loading ? (data?.roles ?? []) : []
  const superAdmin = !!data?.superAdmin

  const items = NAV.filter((x) => x.allow(roles, superAdmin))

  return (
    <nav className="rounded-xl border bg-card p-2 shadow-sm">
      <div className="px-2 py-2 text-xs font-medium text-muted-foreground">Navigation</div>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/60",
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
