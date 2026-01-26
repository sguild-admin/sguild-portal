"use client"

import { useEffect, useState } from "react"
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
import type { OrgRow } from "./orgs-table"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: unknown }
type ApiResponse<T> = ApiOk<T> | ApiFail

type InvitationCreated = {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string | Date
}

async function apiInviteAdmin(orgId: string, input: { email: string }): Promise<InvitationCreated> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/invite-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<InvitationCreated>
  if (!json.ok) throw json.error
  return json.data
}

export function InviteAdminDialog({
  org,
  open,
  onOpenChange,
  onInvited,
}: {
  org: OrgRow | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onInvited: (inv: InvitationCreated) => void
}) {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) setEmail("")
  }, [open])

  async function onSubmit() {
    if (!org) return
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Valid email required")
      return
    }

    setSubmitting(true)
    try {
      const inv = await apiInviteAdmin(org.id, { email: trimmed })
      onInvited(inv)
    } catch {
      toast.error("Failed to create invitation")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-slate-900 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite admin</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <div className="font-medium">{org?.name ?? ""}</div>
            <div className="text-muted-foreground">{org?.slug ?? ""}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} type="button" disabled={submitting}>
            {submitting ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
