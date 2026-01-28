"use client"

import { Button } from "@/components/ui/button"
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
import { Building2, MoreHorizontal, Trash2 } from "lucide-react"
import { ConfirmDeleteDialog } from "@/app/superadmin/_components/confirm-delete-dialog"

export type OrgRow = {
  id: string
  name: string
  slug?: string | null
  createdAt?: unknown
  updatedAt?: unknown
  _count?: { members: number }
}

type OrgCounts = {
  admins: number
  pendingInvites: number
}

function fmtDate(d: unknown) {
  if (!d) return "—"
  const date = typeof d === "string" || d instanceof Date ? new Date(d) : null
  if (!date) return "—"
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()
}

export function OrgsTable({
  orgs,
  counts,
  onRowClick,
  onEdit,
  onDelete,
  onCreate,
  deletingId,
}: {
  orgs: OrgRow[]
  counts: Record<string, OrgCounts | undefined>
  onRowClick: (org: OrgRow) => void
  onEdit: (org: OrgRow) => void
  onDelete: (org: OrgRow) => void | Promise<void>
  onCreate?: () => void
  deletingId?: string | null
}) {
  const emptyState = (
    <div className="mx-auto max-w-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background shadow-sm">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">No organizations yet</div>
          <div className="text-sm text-muted-foreground">
            Create an organization to start managing members
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <TableSurface stickyHeader>
      <div className="md:hidden">
        {orgs.length === 0 ? (
          <div className="px-6 py-10">{emptyState}</div>
        ) : (
          <div className="divide-y divide-border">
            {orgs.map((org) => {
              const meta = counts[org.id]
              return (
                <div key={org.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      className="flex-1 text-left"
                      type="button"
                      onClick={() => onRowClick(org)}
                    >
                      <div className="text-sm font-semibold">{org.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{org.slug ?? "—"}</div>
                      <div className="mt-2 font-mono text-[11px] text-muted-foreground/80">
                        {org.id}
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open menu" type="button">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(org)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <ConfirmDeleteDialog
                          title="Delete organization"
                          description="This permanently deletes the organization and its data."
                          confirmLabel="Delete"
                          confirmLoading={deletingId === org.id}
                          onConfirm={() => onDelete(org)}
                        >
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </ConfirmDeleteDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="rounded-md border border-border/60 px-2 py-2">
                      <div className="text-[11px] uppercase tracking-wide">Members</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {typeof org._count?.members === "number" ? org._count.members : "—"}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 px-2 py-2">
                      <div className="text-[11px] uppercase tracking-wide">Admins</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {meta?.admins ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 px-2 py-2">
                      <div className="text-[11px] uppercase tracking-wide">Pending</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {meta?.pendingInvites ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/60 px-2 py-2">
                      <div className="text-[11px] uppercase tracking-wide">Created</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {fmtDate(org.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Table className="hidden w-full min-w-[760px] md:table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Organization</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Admins</TableHead>
            <TableHead>Pending invites</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orgs.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-10">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            orgs.map((org) => {
              const meta = counts[org.id]
              return (
                <TableRow
                  key={org.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onRowClick(org)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">{org.name}</span>
                      <span className="font-mono text-xs leading-tight text-muted-foreground/80">
                        {org.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {org.slug ?? "—"}
                  </TableCell>

                  <TableCell className="text-sm tabular-nums text-foreground/80">
                    {typeof org._count?.members === "number" ? org._count.members : "—"}
                  </TableCell>

                  <TableCell className="text-sm tabular-nums text-foreground/80">
                    {meta?.admins ?? "—"}
                  </TableCell>

                  <TableCell className="text-sm tabular-nums text-foreground/80">
                    {meta?.pendingInvites ?? "—"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {fmtDate(org.createdAt)}
                  </TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open menu" type="button">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(org)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <ConfirmDeleteDialog
                          title="Delete organization"
                          description="This permanently deletes the organization and its data."
                          confirmLabel="Delete"
                          confirmLoading={deletingId === org.id}
                          onConfirm={() => onDelete(org)}
                        >
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </ConfirmDeleteDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableSurface>
  )
}
