import type { ReactNode } from "react"
import { cn } from "@/lib/utils/cn"

export function TableSurface({
  children,
  stickyHeader,
  className,
}: {
  children: ReactNode
  stickyHeader?: boolean
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-hidden">
        <div className={cn(stickyHeader ? "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10" : "")}>
          {children}
        </div>
      </div>
    </div>
  )
}
