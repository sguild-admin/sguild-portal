"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { InviteAdminDialog } from "./invite-admin-dialog"
import { RoleDialog, type RoleDialogData } from "./role-dialog"
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { rolePillClass } from "@/app/superadmin/organizations/_components/role-pill"

export type AdminItem = {
  id: string
  role: "owner" | "admin" | "coach" | "member"
  createdAt: string | Date
  user: { id: string; name: string | null; email: string | null }
}

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

async function apiUpdateRole(orgId: string, memberId: string, role: AdminItem["role"]) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/admins/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  })

  const json = (await res.json()) as ApiResponse<AdminItem>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiRemoveAdmin(orgId: string, memberId: string) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/admins/${memberId}`, {
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

function titleCaseRole(role: AdminItem["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function getRolePillClass(role: AdminItem["role"]) {
  const key = role.toUpperCase() as keyof typeof rolePillClass
  return rolePillClass[key] ?? rolePillClass.ADMIN
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

export function AdminsTab({
  orgId,
  admins,
  loading,
  onRefresh,
}: {
  orgId: string
  admins: AdminItem[]
  loading: boolean
  onRefresh: () => Promise<void>
}) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [roleDialog, setRoleDialog] = useState<RoleDialogData | null>(null)
  const [submittingRole, setSubmittingRole] = useState(false)
  const [submittingRemoveId, setSubmittingRemoveId] = useState<string | null>(null)

  const rows = useMemo(() => admins, [admins])

  const loadingState = (
    <div className="space-y-1 text-center">
      <div className="text-sm font-medium text-foreground">Loading admins</div>
      <div className="text-sm text-muted-foreground">Fetching organization admins</div>
    </div>
  )

  const emptyState = (
    <div className="mx-auto max-w-xl rounded-lg border border-dashed border-border/70 bg-muted/10 p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background border border-border/60 shadow-sm">
          <UserPlus className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">No admins yet</div>
          <div className="text-sm text-muted-foreground">
            Add an admin to help manage this organization
          </div>
        </div>
      </div>
    </div>
  )

  async function onChangeRole(role: RoleDialogData["role"]) {
    if (!roleDialog) return
    setSubmittingRole(true)
    try {
      await apiUpdateRole(orgId, roleDialog.memberId, role)
      await onRefresh()
      setRoleDialog(null)
      toast.success("Role updated")
    } catch (e) {
      toast.error(getOwnerGuardMessage(e))
    } finally {
      setSubmittingRole(false)
    }
  }

  async function onRemove(memberId: string) {
    setSubmittingRemoveId(memberId)
    try {
      await apiRemoveAdmin(orgId, memberId)
      await onRefresh()
      toast.success("Admin removed")
    } catch (e) {
      toast.error(getOwnerGuardMessage(e))
    } finally {
      setSubmittingRemoveId(null)
    }
  }

  return (
    <div className="space-y-3">
      <TableSurface stickyHeader>
        {/* toolbar */}
        <div className="flex items-center justify-between gap-4 pl-5 pr-4 py-4 border-b border-border/60 bg-card">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-foreground">Admins</div>
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0 text-xs text-muted-foreground"
            >
              {rows.length}
            </Badge>
          </div>

          <Button variant="outline" onClick={() => setInviteOpen(true)} type="button">
            Add admin
          </Button>
        </div>

        <div className="lg:hidden">
          {loading ? (
            <div className="px-6 py-10">{loadingState}</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-10">{emptyState}</div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((admin) => (
                <div key={admin.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {admin.user.name ?? "Unnamed"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {admin.user.email ?? "—"}
                      </div>
                      <Badge
                        className={`mt-2 w-fit rounded-full border ${getRolePillClass(admin.role)}`}
                      >
                        {titleCaseRole(admin.role)}
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
                          onClick={() =>
                            setRoleDialog({
                              memberId: admin.id,
                              name: admin.user.name ?? admin.user.email ?? "User",
                              role: admin.role,
                            })
                          }
                        >
                          Change role
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <ConfirmDeleteDialog
                          title="Remove admin"
                          description="This removes the user’s admin access for this organization."
                          confirmLabel="Remove"
                          confirmLoading={submittingRemoveId === admin.id}
                          onConfirm={() => onRemove(admin.id)}
                        >
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </ConfirmDeleteDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    <div className="text-[11px] uppercase tracking-wide">Created</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {fmtDate(admin.createdAt)}
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
              rows.map((admin) => (
                <TableRow key={admin.id} className="hover:bg-muted/20">
                  <TableCell className="py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {admin.user.name ?? "Unnamed"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {admin.user.email ?? "—"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 text-center">
                    <Badge className={`rounded-full border ${getRolePillClass(admin.role)}`}>
                      {titleCaseRole(admin.role)}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-5 text-right tabular-nums text-foreground/80">
                    {fmtDate(admin.createdAt)}
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
                          onClick={() =>
                            setRoleDialog({
                              memberId: admin.id,
                              name: admin.user.name ?? admin.user.email ?? "User",
                              role: admin.role,
                            })
                          }
                        >
                          Change role
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <ConfirmDeleteDialog
                          title="Remove admin"
                          description="This removes the user’s admin access for this organization."
                          confirmLabel="Remove"
                          confirmLoading={submittingRemoveId === admin.id}
                          onConfirm={() => onRemove(admin.id)}
                        >
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </ConfirmDeleteDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableSurface>

      <InviteAdminDialog orgId={orgId} open={inviteOpen} onOpenChange={setInviteOpen} />

      <RoleDialog
        open={!!roleDialog}
        data={roleDialog}
        onOpenChange={(v) => (!v ? setRoleDialog(null) : null)}
        onSubmit={onChangeRole}
        submitting={submittingRole}
      />
    </div>
  )
}
