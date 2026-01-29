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
import { InviteDialog, type InviteCreated } from "./invite-dialog"
import { InviteLinkDialog } from "./invite-link-dialog"
import { Ban, MailPlus, MoreHorizontal } from "lucide-react"
import { ConfirmDeleteDialog } from "@/app/superadmin/_components/confirm-delete-dialog"

export type InviteItem = {
  id: string
  email: string
  role: string
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
  createdAt: string
  expiresAt: string
  lastSentAt: string | null
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

export function InvitationsTab({
  orgId,
  activeTab,
  invites,
  loading,
  onRefresh,
  inviteDialogOpen,
  invitePrefill,
  onInviteDialogOpenChange,
  onInvitePrefillChange,
}: {
  orgId: string
  activeTab: "admins" | "coaches" | "invitations"
  invites: InviteItem[]
  loading: boolean
  onRefresh: () => Promise<void>
  inviteDialogOpen: boolean
  invitePrefill: { email: string; role: "admin" | "owner" } | null
  onInviteDialogOpenChange: (open: boolean) => void
  onInvitePrefillChange: (prefill: { email: string; role: "admin" | "owner" } | null) => void
}) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [submittingInviteId, setSubmittingInviteId] = useState<string | null>(null)
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
    if (filter === "all") return invites
    return invites.filter((inv) => inv.status === filter.toUpperCase())
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
      setInviteUrl(created.inviteUrl)
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
        <CardHeader className="bg-muted/40 px-4 border-b border-border/60">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="min-w-0">
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
                    <span className="tabular-nums text-muted-foreground">{option.count}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Button
              className="shrink-0"
              onClick={() => {
                onInvitePrefillChange(null)
                onInviteDialogOpenChange(true)
              }}
            >
              Create invite
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[200px] items-center px-6 py-10">
              <div className="space-y-2">
                <div className="text-sm font-medium">Loading invites...</div>
                <div className="text-xs text-muted-foreground">Fetching invitation status.</div>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center px-6 py-10">
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
              <div className="md:hidden">
                <div className="divide-y divide-border">
                  {pagedRows.map((inv) => {
                    const busy = submittingInviteId === inv.id
                    const roleLabel = inv.role
                      ? inv.role.charAt(0).toUpperCase() + inv.role.slice(1)
                      : "—"
                    const roleVariant = inv.role === "coach" ? "secondary" : "default"
                    const statusLabel = inv.status.charAt(0) + inv.status.slice(1).toLowerCase()
                    const statusVariant =
                      inv.status === "PENDING"
                        ? "outline"
                        : inv.status === "ACCEPTED"
                          ? "default"
                          : "secondary"

                    return (
                      <div key={inv.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-foreground">{inv.email}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={roleVariant}>{roleLabel}</Badge>
                              <Badge variant={statusVariant}>{statusLabel}</Badge>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Open menu">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {inv.status === "PENDING" || inv.status === "EXPIRED" ? (
                                <DropdownMenuItem disabled={busy} onClick={() => onResend(inv.id)}>
                                  Resend
                                </DropdownMenuItem>
                              ) : null}

                              {inv.status === "PENDING" ? (
                                <ConfirmDeleteDialog
                                  title="Revoke invite"
                                  description="This revokes the invite immediately."
                                  confirmLabel="Revoke"
                                  confirmLoading={busy}
                                  onConfirm={() => onRevoke(inv.id)}
                                >
                                  <DropdownMenuItem className="text-destructive">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Revoke
                                  </DropdownMenuItem>
                                </ConfirmDeleteDialog>
                              ) : null}

                              {inv.status === "REVOKED" ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const role = inv.role === "owner" ? "owner" : "admin"
                                      onInvitePrefillChange({ email: inv.email, role })
                                      onInviteDialogOpenChange(true)
                                    }}
                                  >
                                    Re-invite
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <Table className="hidden min-w-[900px] md:table">
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
                      const roleVariant = inv.role === "coach" ? "secondary" : "default"
                      const statusLabel = inv.status.charAt(0) + inv.status.slice(1).toLowerCase()
                      const statusVariant =
                        inv.status === "PENDING"
                          ? "outline"
                          : inv.status === "ACCEPTED"
                            ? "default"
                            : "secondary"

                      return (
                        <TableRow key={inv.id} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <Badge variant={roleVariant}>{roleLabel}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant={statusVariant}>{statusLabel}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {fmtDate(inv.lastSentAt)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {fmtDate(inv.expiresAt)}
                          </TableCell>
                          <TableCell className="pr-2">
                            <div className="flex justify-end">
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
                                      onClick={() => onResend(inv.id)}
                                    >
                                      Resend
                                    </DropdownMenuItem>
                                  ) : null}

                                  {inv.status === "PENDING" ? (
                                    <ConfirmDeleteDialog
                                      title="Revoke invite"
                                      description="This revokes the invite immediately."
                                      confirmLabel="Revoke"
                                      confirmLoading={busy}
                                      onConfirm={() => onRevoke(inv.id)}
                                    >
                                      <DropdownMenuItem className="text-destructive">
                                        <Ban className="mr-2 h-4 w-4" />
                                        Revoke
                                      </DropdownMenuItem>
                                    </ConfirmDeleteDialog>
                                  ) : null}

                                  {inv.status === "REVOKED" ? (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          const role = inv.role === "owner" ? "owner" : "admin"
                                          onInvitePrefillChange({ email: inv.email, role })
                                          onInviteDialogOpenChange(true)
                                        }}
                                      >
                                        Re-invite
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      <InviteDialog
        orgId={orgId}
        open={inviteDialogOpen}
        prefill={invitePrefill}
        onOpenChange={(open) => {
          if (!open) onInvitePrefillChange(null)
          onInviteDialogOpenChange(open)
        }}
        onCreated={(created) => {
          setInviteUrl(created.inviteUrl)
          onInvitePrefillChange(null)
          onRefresh()
        }}
      />

      <InviteLinkDialog
        open={!!inviteUrl}
        inviteUrl={inviteUrl}
        onOpenChange={(v) => {
          if (!v) setInviteUrl(null)
        }}
      />
    </div>
  )
}
