"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TeamRowActions } from "./team-row-actions"
import { rolePillClass } from "@/app/superadmin/organizations/_components/role-pill"
import type { TeamMember } from "./team-tab"
import { UserPlus, UserX } from "lucide-react"

type TeamFilter = "all" | "admins" | "coaches" | "disabled"

export function TeamEmptyState({ filter }: { filter: TeamFilter }) {
  const copy =
    filter === "coaches"
      ? {
          icon: UserPlus,
          title: "No coaches to show",
          desc: "Invite a coach to add them to this organization.",
        }
      : filter === "disabled"
        ? {
            icon: UserX,
            title: "No disabled staff to show",
            desc: "No one in this organization is currently disabled.",
          }
        : {
            icon: UserPlus,
            title: "No team to show",
            desc: "Invite an admin or coach to get started.",
          }

  const Icon = copy.icon

  return (
    <div className="flex min-h-50 items-center justify-center px-6 py-10">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-background shadow-sm">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">{copy.title}</div>
          <div className="text-xs text-muted-foreground">{copy.desc}</div>
        </div>
      </div>
    </div>
  )
}

function fmtDate(d: unknown) {
  if (!d) return "—"
  const date = typeof d === "string" || d instanceof Date ? new Date(d) : null
  if (!date) return "—"
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()
}

function displayName(member: TeamMember) {
  return member.name?.trim() || member.email?.trim() || "Unknown"
}

function initials(member: TeamMember) {
  const name = member.name?.trim()
  if (name) {
    const parts = name.split(/\s+/).slice(0, 2)
    return parts.map((part) => part[0]?.toUpperCase()).join("")
  }
  const email = member.email?.trim()
  return email ? email[0]?.toUpperCase() : "?"
}

function roleBadgeClass(role: TeamMember["role"]) {
  const key = role.toUpperCase() as keyof typeof rolePillClass
  return rolePillClass[key] ?? rolePillClass.MEMBER
}

function statusBadgeClass(status: TeamMember["status"]) {
  return status === "DISABLED"
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
}

function statusLabel(status: TeamMember["status"]) {
  return status === "DISABLED" ? "Disabled" : "Active"
}

export function TeamTable({
  orgId,
  rows,
  loading,
  filter,
  onRefresh,
}: {
  orgId: string
  rows: TeamMember[]
  loading: boolean
  filter: TeamFilter
  onRefresh: () => Promise<void>
}) {
  const loadingState = (
    <div className="space-y-1 text-center">
      <div className="text-sm font-medium text-foreground">Loading team</div>
      <div className="text-sm text-muted-foreground">Fetching organization members</div>
    </div>
  )

  const emptyState = <TeamEmptyState filter={filter} />

  return (
    <>
      <Table className="hidden w-full min-w-190 bg-card lg:table">
        <TableHeader className="bg-muted/40 border-y border-border/60">
          <TableRow className="hover:bg-transparent">
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-10 text-center">
                {loadingState}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="p-0 text-center">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((member) => (
              <TableRow key={member.memberId} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {displayName(member)}
                    </span>
                    <span className="text-xs text-muted-foreground">{member.email ?? "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full px-2 py-0 text-xs ${roleBadgeClass(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full px-2 py-0 text-xs ${statusBadgeClass(member.status)}`}>
                    {statusLabel(member.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtDate(member.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <TeamRowActions orgId={orgId} member={member} onRefresh={onRefresh} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="lg:hidden bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center">{loadingState}</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-10 text-center">{emptyState}</div>
        ) : (
          <div className="divide-y divide-border bg-card">
            {rows.map((member) => (
              <div key={member.memberId} className="bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{displayName(member)}</div>
                    <div className="text-xs text-muted-foreground">{member.email ?? "—"}</div>
                  </div>
                  <TeamRowActions orgId={orgId} member={member} onRefresh={onRefresh} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-md border border-border/60 px-2 py-2">
                    <div className="text-[11px] uppercase tracking-wide">Role</div>
                    <div className="mt-1">
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-xs ${roleBadgeClass(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-md border border-border/60 px-2 py-2">
                    <div className="text-[11px] uppercase tracking-wide">Status</div>
                    <div className="mt-1">
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-xs ${statusBadgeClass(member.status)}`}>
                        {statusLabel(member.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
