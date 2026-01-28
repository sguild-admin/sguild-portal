"use client"

import { useEffect, useState } from "react"
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

export type InviteRole = "admin" | "owner"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

export type InviteCreated = {
  invite: {
    id: string
    email: string
    role: InviteRole
    status: string
    expiresAt: string | Date
    createdAt: string | Date
  }
  inviteUrl: string
}

async function apiCreateInvite(
  orgId: string,
  input: { email: string; role: InviteRole; expiresInDays: number }
): Promise<InviteCreated> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<InviteCreated>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

export function InviteDialog({
  orgId,
  open,
  prefill,
  onOpenChange,
  onCreated,
}: {
  orgId: string
  open: boolean
  prefill?: { email: string; role: InviteRole } | null
  onOpenChange: (v: boolean) => void
  onCreated: (created: InviteCreated) => void
}) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<InviteRole>("admin")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setEmail("")
      setRole("admin")
      setError(null)
      setSubmitting(false)
      return
    }
    if (prefill?.email) setEmail(prefill.email)
    const role = prefill?.role === "owner" || prefill?.role === "admin" ? prefill.role : "admin"
    setRole(role)
  }, [open, prefill])

  async function onSubmit() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError("Email is required")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const created = await apiCreateInvite(orgId, {
        email: trimmed,
        role,
        expiresInDays: 7,
      })
      onCreated(created)
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create invite")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-slate-900 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create invite</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={submitting}
              readOnly={Boolean(prefill?.email)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              className="h-10 w-full rounded-md border px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as InviteRole)}
              disabled={submitting}
            >
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          {error ? <div className="text-sm text-destructive">{error}</div> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} type="button" disabled={submitting}>
            {submitting ? "Creating..." : "Create invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
