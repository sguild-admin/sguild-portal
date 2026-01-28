import type { ReactNode } from "react"
import { cn } from "@/lib/utils/cn"

export function PageScaffold({
  title,
  subtitle,
  breadcrumb,
  actions,
  titleClassName,
  subtitleClassName,
  gradient = false,
  children,
}: {
  title: string
  subtitle?: ReactNode
  breadcrumb?: ReactNode
  actions?: ReactNode
  titleClassName?: string
  subtitleClassName?: string
  gradient?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "min-h-screen",
        gradient ? "bg-background" : "bg-background"
      )}
    >
      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-3">
          {breadcrumb ? <div className="text-sm text-muted-foreground">{breadcrumb}</div> : null}

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className={cn("text-2xl font-semibold tracking-tight", titleClassName)}>
                {title}
              </div>
              {subtitle ? (
                <div className={cn("text-sm text-muted-foreground", subtitleClassName)}>
                  {subtitle}
                </div>
              ) : null}
            </div>

            {actions ? <div className="flex items-start gap-2">{actions}</div> : null}
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
