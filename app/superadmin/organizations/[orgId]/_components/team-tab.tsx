"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TableSurface } from "@/components/common/table-surface"
import { TeamTable } from "./team-table"
import type { SuperAdminOrgMemberDto } from "@/modules/super-admin/super-admin.dto"
import { Button } from "@/components/ui/button"

export type TeamMember = SuperAdminOrgMemberDto

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type TeamFilter = "all" | "admins" | "coaches" | "disabled"

async function apiGetTeam(orgId: string): Promise<TeamMember[]> {
  const res = await fetch(`/api/super-admin/organizations/${orgId}/members`, {
    method: "GET",
    cache: "no-store",
  })

  const json = (await res.json()) as ApiResponse<TeamMember[]>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

function matchesSearch(row: TeamMember, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  const name = row.name?.toLowerCase() ?? ""
  const email = row.email?.toLowerCase() ?? ""
  return name.includes(q) || email.includes(q)
}

export function TeamTab({
  orgId,
  onInvite,
}: {
  orgId: string
  onInvite: (role?: "admin" | "coach") => void
}) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<TeamFilter>("all")
  const [search, setSearch] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGetTeam(orgId)
      setMembers(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load team")
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const counts = useMemo(
    () => ({
      all: members.length,
      admins: members.filter((m) => m.role === "admin" || m.role === "owner").length,
      coaches: members.filter((m) => m.role === "coach").length,
      disabled: members.filter((m) => m.status === "DISABLED").length,
    }),
    [members]
  )

  const rows = useMemo(() => {
    const filtered = members.filter((row) => {
      if (filter === "admins") return row.role === "admin" || row.role === "owner"
      if (filter === "coaches") return row.role === "coach"
      if (filter === "disabled") return row.status === "DISABLED"
      return true
    })

    return filtered.filter((row) => matchesSearch(row, search))
  }, [members, filter, search])

  return (
    <div className="space-y-3">
      <TableSurface stickyHeader className="overflow-hidden rounded-md border border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-foreground">Team</div>
            <Badge variant="outline" className="rounded-full px-2 py-0 text-xs text-muted-foreground">
              {rows.length}
            </Badge>
          </div>
          <Button variant="outline" onClick={() => onInvite(filter === "coaches" ? "coach" : undefined)}>
            Add Team Member
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/40 px-5 py-3 lg:bg-card">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as TeamFilter)
            }}
            className="flex flex-wrap gap-2 rounded-lg p-1 lg:bg-card [&_[data-state=on]]:bg-transparent"
          >
            <ToggleGroupItem value="all" className="gap-2">
              All
              <Badge variant="outline" className="rounded-full px-2 py-0 text-[11px] text-muted-foreground">
                {counts.all}
              </Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="admins" className="gap-2">
              Admins
              <Badge
                variant="outline"
                className="hidden rounded-full px-2 py-0 text-[11px] text-muted-foreground lg:inline-flex"
              >
                {counts.admins}
              </Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="coaches" className="gap-2">
              Coaches
              <Badge
                variant="outline"
                className="hidden rounded-full px-2 py-0 text-[11px] text-muted-foreground lg:inline-flex"
              >
                {counts.coaches}
              </Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="disabled" className="gap-2">
              Disabled
              <Badge
                variant="outline"
                className="hidden rounded-full px-2 py-0 text-[11px] text-muted-foreground lg:inline-flex"
              >
                {counts.disabled}
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="hidden w-full max-w-xs lg:block">
            <Input
              placeholder="Search team"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>
        </div>

        <TeamTable
          orgId={orgId}
          rows={rows}
          loading={loading}
          filter={filter}
          onRefresh={refresh}
        />
      </TableSurface>
    </div>
  )
}
