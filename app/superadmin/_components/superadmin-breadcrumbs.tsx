import Link from "next/link"

export type Crumb = { label: string; href?: string }

export function SuperAdminBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast ? <span aria-hidden>›</span> : null}
          </span>
        )
      })}
    </nav>
  )
}
