"use client"

import { useEffect, useId, useState } from "react"
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

export type AdminRole = "admin" | "owner"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string; code?: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

async function apiCreateAdmin(orgId: string, input: { email: string; role: AdminRole }) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<any>
  if (!json.ok) {
    const err = new Error(json.error)
    ;(err as any).code = json.code
    throw err
  }
  return json.data
}

export function CreateAdminDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
  onInviteInstead,
}: {
  orgId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
  onInviteInstead: (email: string) => void
}) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<AdminRole>("admin")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const roleDescriptionId = useId()

  const trimmedEmail = email.trim().toLowerCase()
  const isValidEmail = Boolean(trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))

  const roleDescriptions: Record<AdminRole, string> = {
    owner: "Full access including billing and org settings",
    admin: "Manage staff, schedules, clients",
  }

  useEffect(() => {
    if (!open) {
      setEmail("")
      setRole("admin")
      setSubmitting(false)
      setError(null)
      setNotFound(false)
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
    setNotFound(false)

    try {
      await apiCreateAdmin(orgId, { email: trimmedEmail, role })
      onCreated()
      onOpenChange(false)
    } catch (e) {
      const err = e as Error & { code?: string }
      if (err.code === "NOT_FOUND") {
        setError("User not found for email")
        setNotFound(true)
      } else {
        setError(err.message || "Failed to create admin")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Create admin</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="admin-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="admin-email"
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
            <Label htmlFor="admin-role" className="text-sm font-medium">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as AdminRole)}>
              <SelectTrigger
                id="admin-role"
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
          {notFound ? (
            <Button
              onClick={() => {
                onOpenChange(false)
                onInviteInstead(trimmedEmail)
              }}
              type="button"
              disabled={submitting}
            >
              Create invite instead
            </Button>
          ) : (
            <Button onClick={onSubmit} type="button" disabled={submitting || !isValidEmail}>
              {submitting ? "Creating..." : "Create admin"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
