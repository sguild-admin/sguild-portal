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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDeleteDialog } from "@/app/superadmin/_components/confirm-delete-dialog"
import { MoreHorizontal } from "lucide-react"
import type { TeamMember } from "./team-tab"
import { Textarea } from "@/components/ui/textarea"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

async function apiUpdateStatus(
  orgId: string,
  memberId: string,
  status: "ACTIVE" | "DISABLED"
) {
  const res = await fetch(`/api/super-admin/organizations/${orgId}/members/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })

  const json = (await res.json()) as ApiResponse<unknown>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiRemoveMember(orgId: string, memberId: string) {
  const res = await fetch(`/api/super-admin/organizations/${orgId}/members/${memberId}`, {
    method: "DELETE",
  })

  const json = (await res.json()) as ApiResponse<{ id: string }>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiUpdateRole(orgId: string, memberId: string, role: "admin" | "member") {
  const res = await fetch(
    `/api/super-admin/organizations/${orgId}/members/${memberId}/role`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }
  )

  const json = (await res.json()) as ApiResponse<unknown>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiSetCoach(orgId: string, memberId: string) {
  const res = await fetch(`/api/super-admin/organizations/${orgId}/coaches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId }),
  })

  const json = (await res.json()) as ApiResponse<unknown>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiRemoveCoach(orgId: string, memberId: string) {
  const res = await fetch(`/api/super-admin/organizations/${orgId}/coaches/${memberId}`, {
    method: "DELETE",
  })

  const json = (await res.json()) as ApiResponse<unknown>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

type CoachProfileForm = {
  nickname: string
  bio: string
  notes: string
  address: string
  zip: string
  phone: string
}

async function apiGetCoachProfile(orgId: string, memberId: string) {
  const res = await fetch(
    `/api/super-admin/organizations/${orgId}/coaches/${memberId}/profile`,
    { method: "GET", cache: "no-store" }
  )

  const json = (await res.json()) as ApiResponse<{
    nickname: string | null
    bio: string | null
    notes: string | null
    address: string | null
    zip: string | null
    phone: string | null
  }>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiUpdateCoachProfile(
  orgId: string,
  memberId: string,
  profile: {
    nickname: string | null
    bio: string | null
    notes: string | null
    address: string | null
    zip: string | null
    phone: string | null
  }
) {
  const res = await fetch(
    `/api/super-admin/organizations/${orgId}/coaches/${memberId}/profile`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    }
  )

  const json = (await res.json()) as ApiResponse<unknown>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

export function TeamRowActions({
  orgId,
  member,
  onRefresh,
}: {
  orgId: string
  member: TeamMember
  onRefresh: () => Promise<void>
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [disableOpen, setDisableOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [editCoachOpen, setEditCoachOpen] = useState(false)

  const isOwner = member.role === "owner"
  const isAdmin = member.role === "admin"
  const isCoach = member.role === "coach"
  const isDisabled = member.status === "DISABLED"

  if (isOwner) return null

  const canPromoteToAdmin = member.role === "member"
  const canSetCoach = member.role === "admin"
  const canSetAdmin = member.role === "coach"

  async function handleAction(label: string, fn: () => Promise<unknown>) {
    setBusyAction(label)
    try {
      await fn()
      await onRefresh()
      toast.success("Updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu" type="button">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isDisabled ? (
            <DropdownMenuItem
              disabled={!!busyAction}
              onClick={() => handleAction("enable", () => apiUpdateStatus(orgId, member.memberId, "ACTIVE"))}
            >
              Enable
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={!!busyAction}
              onSelect={() => setDisableOpen(true)}
            >
              Disable
            </DropdownMenuItem>
          )}

          {isCoach ? (
            <DropdownMenuItem onSelect={() => setEditCoachOpen(true)}>
              Edit coach profile
            </DropdownMenuItem>
          ) : null}

          {canPromoteToAdmin ? (
            <DropdownMenuItem
              disabled={!!busyAction}
              onClick={() => handleAction("promote", () => apiUpdateRole(orgId, member.memberId, "admin"))}
            >
              Promote to admin
            </DropdownMenuItem>
          ) : null}

          {canSetCoach ? (
            <DropdownMenuItem
              disabled={!!busyAction}
              onClick={() => handleAction("set-coach", () => apiSetCoach(orgId, member.memberId))}
            >
              Convert to coach
            </DropdownMenuItem>
          ) : null}

          {canSetAdmin ? (
            <DropdownMenuItem
              disabled={!!busyAction}
              onClick={() =>
                handleAction("set-admin", async () => {
                  await apiRemoveCoach(orgId, member.memberId)
                  await apiUpdateRole(orgId, member.memberId, "admin")
                })
              }
            >
              Convert to admin
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={!!busyAction}
            onSelect={() => setRemoveOpen(true)}
          >
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        title="Disable member"
        description="This will disable the member and remove their access."
        confirmLabel="Disable"
        confirmLoading={busyAction === "disable"}
        open={disableOpen}
        onOpenChange={setDisableOpen}
        onConfirm={() =>
          handleAction("disable", () => apiUpdateStatus(orgId, member.memberId, "DISABLED"))
        }
      />

      <ConfirmDeleteDialog
        title="Remove member"
        description="This permanently removes the member from the organization."
        confirmLabel="Remove"
        confirmLoading={busyAction === "remove"}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onConfirm={() => handleAction("remove", () => apiRemoveMember(orgId, member.memberId))}
      />

      <CoachProfileDialog
        open={editCoachOpen}
        onOpenChange={setEditCoachOpen}
        orgId={orgId}
        memberId={member.memberId}
        disabled={!!busyAction}
        onSaved={onRefresh}
      />
    </>
  )
}

function CoachProfileDialog({
  open,
  onOpenChange,
  orgId,
  memberId,
  disabled,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: string
  memberId: string
  disabled: boolean
  onSaved: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CoachProfileForm>({
    nickname: "",
    bio: "",
    notes: "",
    address: "",
    zip: "",
    phone: "",
  })

  useEffect(() => {
    if (!open) return
    setLoading(true)
    apiGetCoachProfile(orgId, memberId)
      .then((profile) => {
        setForm({
          nickname: profile.nickname ?? "",
          bio: profile.bio ?? "",
          notes: profile.notes ?? "",
          address: profile.address ?? "",
          zip: profile.zip ?? "",
          phone: profile.phone ?? "",
        })
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load coach profile")
      })
      .finally(() => setLoading(false))
  }, [open, orgId, memberId])

  function toNullable(value: string) {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }

  async function onSave() {
    setSaving(true)
    try {
      await apiUpdateCoachProfile(orgId, memberId, {
        nickname: toNullable(form.nickname),
        bio: toNullable(form.bio),
        notes: toNullable(form.notes),
        address: toNullable(form.address),
        zip: toNullable(form.zip),
        phone: toNullable(form.phone),
      })
      await onSaved()
      onOpenChange(false)
      toast.success("Coach profile updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update coach profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit coach profile</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`coach-nickname-${memberId}`}>Nickname</Label>
            <Input
              id={`coach-nickname-${memberId}`}
              value={form.nickname}
              onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
              disabled={loading || saving || disabled}
              className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`coach-bio-${memberId}`}>Bio</Label>
            <Textarea
              id={`coach-bio-${memberId}`}
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              disabled={loading || saving || disabled}
              className="min-h-24 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`coach-notes-${memberId}`}>Notes</Label>
            <Textarea
              id={`coach-notes-${memberId}`}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={loading || saving || disabled}
              className="min-h-24 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`coach-address-${memberId}`}>Address</Label>
            <Input
              id={`coach-address-${memberId}`}
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              disabled={loading || saving || disabled}
              className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`coach-zip-${memberId}`}>Zip</Label>
            <Input
              id={`coach-zip-${memberId}`}
              value={form.zip}
              onChange={(e) => setForm((prev) => ({ ...prev, zip: e.target.value }))}
              disabled={loading || saving || disabled}
              className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`coach-phone-${memberId}`}>Phone</Label>
            <Input
              id={`coach-phone-${memberId}`}
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              disabled={loading || saving || disabled}
              className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={onSave} type="button" disabled={loading || saving || disabled}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
