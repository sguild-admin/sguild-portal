"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type OverviewOrgDto = {
  id: string
  name: string
  slug?: string | null
  createdAt?: unknown
  _count?: { members: number }
  settings?: {
    timeZone: string
    offersOceanLessons: boolean
  } | null
}

type OverviewTabProps = {
  org: OverviewOrgDto
}

function fmtDate(d?: unknown) {
  if (!d) return "—"
  const date = new Date(d as any)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()
}

export function OverviewTab({ org }: OverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <Card>
        <CardHeader className="pb-4 pt-4">
          <div className="flex w-full flex-col justify-center gap-3">
            <CardTitle className="text-base">Overview</CardTitle>
            <div className="h-px w-full bg-border/60" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="text-sm font-medium text-foreground">{org.name}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Slug</div>
              <div className="inline-flex rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground/80">
                {org.slug ?? "—"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm font-medium tabular-nums text-foreground/90">
                {fmtDate(org.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Time zone</div>
              <div className="text-sm font-medium text-foreground">
                {org.settings?.timeZone ?? "—"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Ocean lessons</div>
              <div className="text-sm font-medium text-foreground">
                {org.settings
                  ? org.settings.offersOceanLessons
                    ? "Offered"
                    : "Not Offered"
                  : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Log</CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            Coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
