/* Deprecated: replaced by Team tab. Safe to delete.
"use client"

import { useEffect, useId, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InviteLinkDialog } from "../invites/invite-link-dialog"

export type AdminInviteRole = "admin" | "owner"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

export type AdminInviteCreated = {
  invite: {
    id: string
    email: string
    role: AdminInviteRole
    status: string
    expiresAt: string | Date
    createdAt: string | Date
  }
  inviteUrl: string
}

async function apiCreateInvite(
  orgId: string,
  input: { email: string; role: AdminInviteRole; expiresInDays: number }
): Promise<AdminInviteCreated> {
  const res = await fetch(`/api/super-admin/organizations/${orgId}/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<AdminInviteCreated>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

export function InviteAdminDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  // Deprecated: replaced by Team tab. Safe to delete.
  // Deprecated: replaced by Team tab. Safe to delete.
  // Deprecated: replaced by Team tab. Safe to delete.
}) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<AdminInviteRole>("admin")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const roleDescriptionId = useId()
  const trimmedEmail = email.trim().toLowerCase()
  const isValidEmail = Boolean(trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))

  const roleDescriptions: Record<AdminInviteRole, string> = {
    owner: "Full access including billing and org settings",
    admin: "Manage staff, schedules, clients",
  }

  useEffect(() => {
    if (!open) {
      setEmail("")
      setRole("admin")
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  async function onSubmit() {
    if (!trimmedEmail) {
      setError("Email is required")
      return
    }
    if (!isValidEmail) {
      setError("Enter a valid email address")
      // Deprecated: replaced by Team tab. Safe to delete.
    */