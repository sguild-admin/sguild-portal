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
  const res = await fetch(`/api/super-admin/orgs/${orgId}/invitations`, {
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
      setInviteUrl(created.inviteUrl)
      onOpenChange(false)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create invite"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle>Create admin invite</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="admin-invite-email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="admin-invite-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="name@domain.com"
                autoComplete="email"
                disabled={submitting}
                className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
              />
              {error ? <div className="text-xs text-destructive">{error}</div> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-invite-role" className="text-sm font-medium">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as AdminInviteRole)}>
                <SelectTrigger
                  id="admin-invite-role"
                  className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
                  disabled={submitting}
                  aria-describedby={roleDescriptionId}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="owner"
                    text="Owner"
                    description="Full access including billing and org settings"
                  />
                  <SelectItem
                    value="admin"
                    text="Admin"
                    description="Manage staff, schedules, clients"
                  />
                </SelectContent>
              </Select>
              <p id={roleDescriptionId} className="pl-1 text-xs text-muted-foreground">
                {roleDescriptions[role]}
              </p>
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
              {submitting ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteLinkDialog
        open={!!inviteUrl}
        inviteUrl={inviteUrl ?? ""}
        onOpenChange={(v) => {
          if (!v) setInviteUrl(null)
        }}
      />
    </>
  )
}