"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

export type CoachProfileDialogData = {
  memberId: string
  userId: string
  name: string | null
  email: string | null
}

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type CoachAvailability = {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

type CoachProfileResponse = {
  id: string
  status: "ACTIVE" | "DISABLED"
  nickname: string | null
  notes: string | null
  address: string | null
  phone: string | null
  availability?: CoachAvailability[]
}

type CoachProfileFormState = {
  nickname: string
  notes: string
  address: string
  phone: string
}

const dayOptions = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

function toNullable(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function statusLabel(status: CoachProfileResponse["status"]) {
  return status === "DISABLED" ? "Disabled" : "Enabled"
}

export function CoachProfileDialog({
  orgId,
  open,
  data,
  onOpenChange,
  onSaved,
}: {
  orgId: string
  open: boolean
  data: CoachProfileDialogData | null
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<CoachProfileResponse["status"]>("ACTIVE")
  const [profile, setProfile] = useState<CoachProfileFormState>({
    nickname: "",
    notes: "",
    address: "",
    phone: "",
  })
  const [availability, setAvailability] = useState<CoachAvailability[]>([])

  const title = useMemo(() => data?.name ?? data?.email ?? "Coach profile", [data])

  useEffect(() => {
    if (!open || !data) return
    let active = true
    setLoading(true)
    fetch(`/api/super-admin/orgs/${orgId}/coaches/${data.memberId}/profile`, {
      method: "GET",
      cache: "no-store",
    })
      .then(async (res) => {
        const json = (await res.json()) as ApiResponse<CoachProfileResponse>
        if (!json.ok) throw new Error(json.error)
        return json.data
      })
      .then((payload) => {
        if (!active) return
        setStatus(payload.status)
        setProfile({
          nickname: payload.nickname ?? "",
          notes: payload.notes ?? "",
          address: payload.address ?? "",
          phone: payload.phone ?? "",
        })
        setAvailability(
          payload.availability?.map((slot) => ({
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })) ?? []
        )
      })
      .catch((error) => {
        if (!active) return
        toast.error(error instanceof Error ? error.message : "Failed to load coach profile")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [data, open, orgId])

  function updateAvailability(index: number, next: Partial<CoachAvailability>) {
    setAvailability((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, ...next } : slot))
    )
  }

  function addAvailability() {
    setAvailability((prev) => [
      ...prev,
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    ])
  }

  function removeAvailability(index: number) {
    setAvailability((prev) => prev.filter((_, idx) => idx !== index))
  }

  async function onSave() {
    if (!data) return
    setSaving(true)
    try {
      const payload = {
        profile: {
          nickname: toNullable(profile.nickname),
          notes: toNullable(profile.notes),
          address: toNullable(profile.address),
          phone: toNullable(profile.phone),
        },
        availability: availability.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      }

      const res = await fetch(`/api/super-admin/orgs/${orgId}/coaches/${data.memberId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as ApiResponse<CoachProfileResponse>
      if (!json.ok) throw new Error(json.error)

      toast.success("Coach profile updated")
      await onSaved()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save coach profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="text-xs text-muted-foreground">Status: {statusLabel(status)}</div>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-sm text-muted-foreground">Loading coach profile...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coach-nickname">Nickname</Label>
                <Input
                  id="coach-nickname"
                  value={profile.nickname}
                  onChange={(e) => setProfile((prev) => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Optional nickname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-phone">Phone</Label>
                <Input
                  id="coach-phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-address">Address</Label>
              <Input
                id="coach-address"
                value={profile.address}
                onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Street, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-notes">Notes</Label>
              <Textarea
                id="coach-notes"
                value={profile.notes}
                onChange={(e) => setProfile((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes for this coach"
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">Availability</div>
                <Button variant="outline" size="sm" onClick={addAvailability} type="button">
                  <Plus className="mr-2 h-4 w-4" /> Add slot
                </Button>
              </div>

              {availability.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                  No availability slots set yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {availability.map((slot, index) => (
                    <div
                      key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${index}`}
                      className="grid gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 md:grid-cols-[160px_1fr_1fr_auto]"
                    >
                      <div>
                        <Label className="text-xs">Day</Label>
                        <Select
                          value={String(slot.dayOfWeek)}
                          onValueChange={(value) => updateAvailability(index, { dayOfWeek: Number(value) })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOptions.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Start</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateAvailability(index, { startTime: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">End</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateAvailability(index, { endTime: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeAvailability(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || loading} type="button">
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
