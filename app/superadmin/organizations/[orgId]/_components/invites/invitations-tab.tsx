"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TableSurface } from "@/components/common/table-surface"
import type { InviteCreated } from "./invite-dialog"
import { Ban, MailPlus, MoreHorizontal } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { rolePillClass } from "@/app/superadmin/organizations/_components/role-pill"

export type InviteItem = {
  id: string
  email: string
  role: string
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
  createdAt: string
  expiresAt: string
  lastSentAt: string | null
  acceptedAt?: string | null
  revokedAt?: string | null
}

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type InviteFilter = "pending" | "accepted" | "revoked" | "expired" | "all"

async function apiResendInvite(inviteId: string): Promise<InviteCreated> {
  const res = await fetch(`/api/super-admin/invitations/${inviteId}/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresInDays: 7 }),
  })

  const json = (await res.json()) as ApiResponse<InviteCreated>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiRevokeInvite(inviteId: string): Promise<void> {
  const res = await fetch(`/api/super-admin/invitations/${inviteId}/revoke`, {
    method: "POST",
  })

  const json = (await res.json()) as ApiResponse<unknown>
  if (!json.ok) throw new Error(json.error)
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function fmtDate(d: string | null) {
  if (!d) return "—"
  const date = new Date(d)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

function getCreatedAtTime(value: string) {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function getLogTime(inv: InviteItem) {
  const candidates = [inv.revokedAt, inv.acceptedAt, inv.lastSentAt, inv.createdAt]
    .filter(Boolean)
    .map((value) => {
      const time = new Date(value as string).getTime()
      return Number.isNaN(time) ? 0 : time
    })
  if (candidates.length === 0) return 0
  return Math.max(...candidates)
}

export function InvitationsTab({
  orgId,
  activeTab,
  invites,
  loading,
  onRefresh,
  onInviteUrl,
  onInviteDialogOpenChange,
  onInvitePrefillChange,
}: {
  orgId: string
  activeTab: "overview" | "team" | "invitations" | "settings"
  invites: InviteItem[]
  loading: boolean
  onRefresh: () => Promise<void>
  onInviteUrl: (url: string) => void
  onInviteDialogOpenChange: (open: boolean) => void
  onInvitePrefillChange: (prefill: { email: string; role: "admin" | "coach" } | null) => void
}) {
  const [submittingInviteId, setSubmittingInviteId] = useState<string | null>(null)
  const [revokeInviteId, setRevokeInviteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<InviteFilter>("pending")
  const [page, setPage] = useState(0)

  const pageSize = 25

  const counts = useMemo(
    () => ({
      pending: invites.filter((inv) => inv.status === "PENDING").length,
      accepted: invites.filter((inv) => inv.status === "ACCEPTED").length,
      revoked: invites.filter((inv) => inv.status === "REVOKED").length,
      expired: invites.filter((inv) => inv.status === "EXPIRED").length,
      all: invites.length,
    }),
    [invites]
  )

  useEffect(() => {
    if (activeTab !== "invitations") return
    setFilter(counts.pending > 0 ? "pending" : "all")
    setPage(0)
  }, [activeTab])

  const rows = useMemo(() => {
    const sorted = [...invites].sort((a, b) => getLogTime(b) - getLogTime(a))
    if (filter === "all") return sorted
    return sorted.filter((inv) => inv.status === filter.toUpperCase())
  }, [invites, filter])

  useEffect(() => {
    setPage(0)
  }, [filter])

  const totalRows = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const clampedPage = Math.min(page, totalPages - 1)
  const pageStart = totalRows === 0 ? 0 : clampedPage * pageSize + 1
  const pageEnd = Math.min(totalRows, (clampedPage + 1) * pageSize)
  const pagedRows = rows.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize)

  const filterOptions = [
    { value: "pending" as const, label: "Pending", count: counts.pending },
    { value: "accepted" as const, label: "Accepted", count: counts.accepted },
    { value: "revoked" as const, label: "Revoked", count: counts.revoked },
    { value: "expired" as const, label: "Expired", count: counts.expired },
    { value: "all" as const, label: "All", count: counts.all },
  ]

  async function onResend(inviteId: string) {
    setSubmittingInviteId(inviteId)
    try {
      const created = await apiResendInvite(inviteId)
      onInviteUrl(created.inviteUrl)
      await onRefresh()
      toast.success("Invite resent")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend")
    } finally {
      setSubmittingInviteId(null)
    }
  }

  async function onRevoke(inviteId: string) {
    setSubmittingInviteId(inviteId)
    try {
      await apiRevokeInvite(inviteId)
      await onRefresh()
      toast.success("Invite revoked")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke")
    } finally {
      setSubmittingInviteId(null)
    }
  }

  const pagination = (
    <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
      <div className="tabular-nums">
        {pageStart} to {pageEnd} of {totalRows}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={clampedPage === 0}
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={clampedPage >= totalPages - 1}
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="border-b border-border/60 bg-card px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-foreground">Invitations</div>
              <Badge
                variant="outline"
                className="rounded-full px-2 py-0 text-xs text-muted-foreground"
              >
                {rows.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onInvitePrefillChange(null)
                onInviteDialogOpenChange(true)
              }}
            >
              Create Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(value) => {
                if (value) setFilter(value as InviteFilter)
              }}
            >
              {filterOptions.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                  <span
                    className={`tabular-nums text-muted-foreground ${
                      option.value === "all" ? "" : "hidden lg:inline"
                    }`}
                  >
                    {option.count}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {loading ? (
            <div className="flex min-h-50 items-center px-6 py-10">
              <div className="space-y-2">
                <div className="text-sm font-medium">Loading invites...</div>
                <div className="text-xs text-muted-foreground">Fetching invitation status.</div>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-50 items-center justify-center px-6 py-10">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-background shadow-sm">
                  <MailPlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">No invites to show</div>
                  <div className="text-xs text-muted-foreground">
                    Create an invite to bring new members in.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="lg:hidden bg-card">
                <div className="divide-y divide-border bg-card">
                  {pagedRows.map((inv) => {
                    const busy = submittingInviteId === inv.id
                    const roleLabel = inv.role
                      ? inv.role.charAt(0).toUpperCase() + inv.role.slice(1)
                      : "—"
                    const roleClasses =
                      rolePillClass[inv.role.toUpperCase() as keyof typeof rolePillClass] ??
                      rolePillClass.ADMIN
                    const statusLabel = inv.status.charAt(0) + inv.status.slice(1).toLowerCase()
                    const statusClasses =
                      inv.status === "PENDING"
                        ? "border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60"
                        : inv.status === "ACCEPTED"
                          ? "border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60"
                          : inv.status === "REVOKED"
                            ? "border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60"
                            : "border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-200 dark:border-slate-800/60"

                    return (
                      <div key={inv.id} className="bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-foreground">{inv.email}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={`border ${roleClasses}`}>{roleLabel}</Badge>
                              <Badge className={statusClasses}>{statusLabel}</Badge>
                            </div>
                          </div>

                          {inv.status === "ACCEPTED" ? null : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Open menu">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {inv.status === "PENDING" || inv.status === "EXPIRED" ? (
                                  <DropdownMenuItem
                                    disabled={busy}
                                    onSelect={(event) => {
                                      event.preventDefault()
                                      onResend(inv.id)
                                    }}
                                  >
                                    Resend
                                  </DropdownMenuItem>
                                ) : null}

                                {inv.status === "PENDING" || inv.status === "EXPIRED" ? (
                                  <DropdownMenuSeparator />
                                ) : null}

                                {inv.status === "PENDING" ? (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(event) => {
                                      event.preventDefault()
                                      setRevokeInviteId(inv.id)
                                    }}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Revoke
                                  </DropdownMenuItem>
                                ) : null}

                                {inv.status === "REVOKED" ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const role = inv.role === "coach" ? "coach" : "admin"
                                      onInvitePrefillChange({ email: inv.email, role })
                                      onInviteDialogOpenChange(true)
                                    }}
                                  >
                                    Re-invite
                                  </DropdownMenuItem>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                          <div className="rounded-md border border-border/60 px-2 py-2">
                            <div className="text-[11px] uppercase tracking-wide">Sent</div>
                            <div className="mt-1 text-sm font-semibold text-foreground">
                              {fmtDate(inv.lastSentAt)}
                            </div>
                          </div>
                          <div className="rounded-md border border-border/60 px-2 py-2">
                            <div className="text-[11px] uppercase tracking-wide">Expires</div>
                            <div className="mt-1 text-sm font-semibold text-foreground">
                              {fmtDate(inv.expiresAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <TableSurface stickyHeader className="border-0 shadow-none">
                <Table className="hidden min-w-225 lg:table">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-b border-border/60">
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Sent</TableHead>
                      <TableHead className="text-xs">Expires</TableHead>
                      <TableHead className="text-right text-xs pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRows.map((inv) => {
                      const busy = submittingInviteId === inv.id
                      const roleLabel = inv.role
                        ? inv.role.charAt(0).toUpperCase() + inv.role.slice(1)
                        : "—"
                      const roleClasses =
                        rolePillClass[inv.role.toUpperCase() as keyof typeof rolePillClass] ??
                        rolePillClass.ADMIN
                      const statusLabel = inv.status.charAt(0) + inv.status.slice(1).toLowerCase()
                      const statusClasses =
                        inv.status === "PENDING"
                          ? "border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60"
                          : inv.status === "ACCEPTED"
                            ? "border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60"
                            : inv.status === "REVOKED"
                              ? "border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60"
                              : "border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-200 dark:border-slate-800/60"

                      return (
                        <TableRow key={inv.id} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <Badge className={`border ${roleClasses}`}>{roleLabel}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge className={statusClasses}>{statusLabel}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {fmtDate(inv.lastSentAt)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {fmtDate(inv.expiresAt)}
                          </TableCell>
                          <TableCell className="pr-2">
                            <div className="flex justify-end">
                              {inv.status === "ACCEPTED" ? null : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Open menu">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {inv.status === "PENDING" || inv.status === "EXPIRED" ? (
                                      <DropdownMenuItem
                                        disabled={busy}
                                        onSelect={(event) => {
                                          event.preventDefault()
                                          onResend(inv.id)
                                        }}
                                      >
                                        Resend
                                      </DropdownMenuItem>
                                    ) : null}

                                    {inv.status === "PENDING" || inv.status === "EXPIRED" ? (
                                      <DropdownMenuSeparator />
                                    ) : null}

                                    {inv.status === "PENDING" ? (
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(event) => {
                                          event.preventDefault()
                                          setRevokeInviteId(inv.id)
                                        }}
                                      >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Revoke
                                      </DropdownMenuItem>
                                    ) : null}

                                    {inv.status === "REVOKED" ? (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          const role = inv.role === "coach" ? "coach" : "admin"
                                          onInvitePrefillChange({ email: inv.email, role })
                                          onInviteDialogOpenChange(true)
                                        }}
                                      >
                                        Re-invite
                                      </DropdownMenuItem>
                                    ) : null}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableSurface>
              {pagination}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!revokeInviteId}
        onOpenChange={(open) => (!open ? setRevokeInviteId(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invite</AlertDialogTitle>
            <AlertDialogDescription>This revokes the invite immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!revokeInviteId) return
                await onRevoke(revokeInviteId)
                setRevokeInviteId(null)
              }}
              disabled={Boolean(revokeInviteId && submittingInviteId === revokeInviteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeInviteId && submittingInviteId === revokeInviteId ? "Working..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
