"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type OrgRow = {
  id: string
  name: string
  slug?: string | null
  createdAt?: unknown
  updatedAt?: unknown
  _count?: { members: number }
}

function fmtDate(d: unknown) {
  if (!d) return ""
  const date = typeof d === "string" || d instanceof Date ? new Date(d) : null
  if (!date) return ""
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString()
}

export function OrgsTable({
  orgs,
  onInviteAdmin,
}: {
  orgs: OrgRow[]
  onInviteAdmin: (org: OrgRow) => void
}) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Org</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orgs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No organizations yet
              </TableCell>
            </TableRow>
          ) : (
            orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell className="text-muted-foreground">{org.slug ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{org._count?.members ?? 0}</TableCell>
                <TableCell className="text-muted-foreground">{fmtDate(org.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <button
                    className="text-sm underline underline-offset-4"
                    onClick={() => onInviteAdmin(org)}
                    type="button"
                  >
                    Invite admin
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
