"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableSurface } from "@/components/common/table-surface"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDeleteDialog } from "@/app/superadmin/_components/confirm-delete-dialog"
import { MoreHorizontal, Trash2, Users } from "lucide-react"
import { rolePillClass } from "@/app/superadmin/organizations/_components/role-pill"

export type CoachItem = {
  id: string
  role: "coach" | "member"
  createdAt: string | Date
  user: { id: string; name: string | null; email: string | null }
}

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

async function apiRemoveCoach(orgId: string, memberId: string) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/coaches/${memberId}`, {
    method: "DELETE",
  })

  const json = (await res.json()) as ApiResponse<{ id: string }>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

function fmtDate(d: unknown) {
  if (!d) return "—"
  const date = typeof d === "string" || d instanceof Date ? new Date(d) : null
  if (!date) return "—"
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()
}

function titleCaseRole(role: CoachItem["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function getRolePillClass(role: CoachItem["role"]) {
  const key = role.toUpperCase() as keyof typeof rolePillClass
  return rolePillClass[key] ?? rolePillClass.COACH
}

function getOwnerGuardMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("owner")) {
      return "Organization must have an owner"
    }
    return error.message
  }
  return "Something went wrong"
}

export function CoachesTab({
  orgId,
  coaches,
  loading,
  onRefresh,
  onInviteRequested,
}: {
  orgId: string
  coaches: CoachItem[]
  loading: boolean
  onRefresh: () => Promise<void>
  onInviteRequested: (email: string) => void
}) {
  const [submittingRemoveId, setSubmittingRemoveId] = useState<string | null>(null)
  const [removeDialogId, setRemoveDialogId] = useState<string | null>(null)

  const rows = useMemo(() => coaches, [coaches])
  const removeTarget = useMemo(
    () => (removeDialogId ? rows.find((coach) => coach.id === removeDialogId) ?? null : null),
    [removeDialogId, rows]
  )

  const loadingState = (
    <div className="space-y-1 text-center">
      <div className="text-sm font-medium text-foreground">Loading coaches</div>
      <div className="text-sm text-muted-foreground">Fetching organization coaches</div>
    </div>
  )

  const emptyState = (
    <div className="mx-auto max-w-xl rounded-lg border border-dashed border-border/70 bg-muted/10 p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border/60 shadow-sm">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">No coaches yet</div>
          <div className="text-sm text-muted-foreground">
            Add coaches to help with instruction and scheduling
          </div>
        </div>
      </div>
    </div>
  )

  async function onRemove(memberId: string) {
    setSubmittingRemoveId(memberId)
    try {
      await apiRemoveCoach(orgId, memberId)
      await onRefresh()
      toast.success("Coach removed")
    } catch (e) {
      toast.error(getOwnerGuardMessage(e))
    } finally {
      setSubmittingRemoveId(null)
    }
  }

  return (
    <div className="space-y-3">
      <TableSurface stickyHeader>
        <div className="flex items-center justify-between gap-4 pl-5 pr-4 py-4 border-b border-border/60 bg-card">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-foreground">Coaches</div>
            <Badge variant="outline" className="rounded-full px-2 py-0 text-xs text-muted-foreground">
              {rows.length}
            </Badge>
          </div>
          <Button variant="outline" onClick={() => onInviteRequested("")} type="button">
            Add coach
          </Button>
        </div>

        <div className="lg:hidden">
          {loading ? (
            <div className="px-6 py-10">{loadingState}</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-10">{emptyState}</div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((coach) => (
                <div key={coach.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {coach.user.name ?? "Unnamed"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {coach.user.email ?? "—"}
                      </div>
                      <Badge className={`mt-2 w-fit rounded-full border ${getRolePillClass(coach.role)}`}>
                        {titleCaseRole(coach.role)}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open menu">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setRemoveDialogId(coach.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    <div className="text-[11px] uppercase tracking-wide">Created</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {fmtDate(coach.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Table className="hidden min-w-[900px] lg:table">
          <TableHeader className="bg-muted/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="w-[220px] text-center text-xs">Role</TableHead>
              <TableHead className="w-[160px] text-right text-xs">Created</TableHead>
              <TableHead className="w-[72px] pr-4 text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-10">
                  {loadingState}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-10">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((coach) => (
                <TableRow key={coach.id} className="hover:bg-muted/20">
                  <TableCell className="py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {coach.user.name ?? "Unnamed"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {coach.user.email ?? "—"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 text-center">
                    <Badge className={`rounded-full border ${getRolePillClass(coach.role)}`}>
                      {titleCaseRole(coach.role)}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-5 text-right tabular-nums text-foreground/80">
                    {fmtDate(coach.createdAt)}
                  </TableCell>

                  <TableCell className="py-5 pr-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open menu">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setRemoveDialogId(coach.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableSurface>

      <ConfirmDeleteDialog
        title="Remove coach"
        description="This removes the user’s access to this organization."
        confirmLabel="Remove"
        confirmLoading={submittingRemoveId === removeDialogId}
        open={!!removeDialogId}
        onOpenChange={(open) => (!open ? setRemoveDialogId(null) : null)}
        onConfirm={async () => {
          if (!removeTarget) return
          try {
            await onRemove(removeTarget.id)
          } finally {
            setRemoveDialogId(null)
          }
        }}
      />
    </div>
  )
}
