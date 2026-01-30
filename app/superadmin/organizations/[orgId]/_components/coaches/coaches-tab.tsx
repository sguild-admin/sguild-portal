/* Deprecated: replaced by Team tab. Safe to delete.
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
import { CoachProfileDialog, type CoachProfileDialogData } from "./coach-profile-dialog"
import { Eye, MoreHorizontal, Power, Trash2, Users } from "lucide-react"
import { rolePillClass } from "@/app/superadmin/organizations/_components/role-pill"

export type CoachItem = {
  id: string
  role: "coach" | "member"
  createdAt: string | Date
  status: "ACTIVE" | "DISABLED"
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

async function apiUpdateCoachStatus(
  orgId: string,
  memberId: string,
  status: CoachItem["status"]
) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/coaches/${memberId}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
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

// Deprecated: replaced by Team tab. Safe to delete.
  // Deprecated: replaced by Team tab. Safe to delete.
  // Deprecated: replaced by Team tab. Safe to delete.
  // Deprecated: replaced by Team tab. Safe to delete.
  return role.charAt(0).toUpperCase() + role.slice(1)
*/
