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

export type InviteRole = "admin" | "coach"

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
  const res = await fetch(`/api/super-admin/organizations/${orgId}/invitations`, {
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
  const roleDescriptionId = useId()

  const trimmedEmail = email.trim().toLowerCase()
  const isValidEmail = Boolean(trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))

  const roleDescriptions: Record<InviteRole, string> = {
    admin: "Manage staff, schedules, clients",
    coach: "Coach tools only",
  }

  useEffect(() => {
    if (!open) {
      setEmail("")
      setRole("admin")
      setError(null)
      setSubmitting(false)
      return
    }
    if (prefill?.email) setEmail(prefill.email)
    const role = prefill?.role === "admin" || prefill?.role === "coach" ? prefill.role : "admin"
    setRole(role)
  }, [open, prefill])

  async function onSubmit() {
    if (!trimmedEmail) {
      setError("Email is required")
      return
    }
    if (!isValidEmail) {
      setError("Enter a valid email address")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const created = await apiCreateInvite(orgId, {
        email: trimmedEmail,
        role,
        expiresInDays: 7,
      })
      onCreated(created)
      onOpenChange(false)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create invite"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Create invite</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="invite-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              placeholder="name@domain.com"
              autoComplete="email"
              disabled={submitting}
              readOnly={Boolean(prefill?.email)}
              className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
            {error ? <div className="text-xs text-destructive">{error}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </Label>
            <>
              <Select value={role} onValueChange={(value) => setRole(value as InviteRole)}>
                <SelectTrigger
                  id="invite-role"
                  className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
                  disabled={submitting}
                  aria-describedby={roleDescriptionId}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="admin"
                    text="Admin"
                    description="Manage staff, schedules, clients"
                  />
                  <SelectItem value="coach" text="Coach" description="Coach tools only" />
                </SelectContent>
              </Select>
              <p id={roleDescriptionId} className="pl-1 text-xs text-muted-foreground">
                {roleDescriptions[role]}
              </p>
            </>
          </div>
        </div>

        <DialogFooter className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} type="button" disabled={submitting || !isValidEmail}>
            {submitting ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
