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
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError("Email is required")
      return
    }

    setSubmitting(true)
    setError(null)
    setNotFound(false)

    try {
      await apiCreateAdmin(orgId, { email: trimmed, role })
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
      <DialogContent className="bg-white text-slate-900 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create admin</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-role">Role</Label>
            <select
              id="admin-role"
              className="h-10 w-full rounded-md border px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
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
          {notFound ? (
            <Button
              onClick={() => {
                const trimmed = email.trim().toLowerCase()
                onOpenChange(false)
                onInviteInstead(trimmed)
              }}
              type="button"
              disabled={submitting}
            >
              Create invite instead
            </Button>
          ) : (
            <Button onClick={onSubmit} type="button" disabled={submitting}>
              {submitting ? "Creating..." : "Create admin"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
