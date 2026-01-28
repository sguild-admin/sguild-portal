"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type OverviewOrgDto = {
  id: string
  name: string
  slug?: string | null
  createdAt?: unknown
  _count?: { members: number }
}

type OverviewTabProps = {
  org: OverviewOrgDto
  adminsCount: number
  pendingInvites: number
  invitesCount: number
}

function fmtDate(d?: unknown) {
  if (!d) return "—"
  const date = new Date(d as any)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums leading-none text-foreground">
        {value}
      </div>
    </div>
  )
}

export function OverviewTab({
  org,
  adminsCount,
  pendingInvites,
  invitesCount,
}: OverviewTabProps) {
  const membersCount =
    typeof org._count?.members === "number" ? org._count.members : "—"

  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Organization</CardTitle>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Counts</CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Members" value={membersCount} />
            <Stat label="Admins" value={adminsCount} />
            <Stat label="Pending invites" value={pendingInvites} />
            <Stat label="Total invites" value={invitesCount} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
