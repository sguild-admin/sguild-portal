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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { OrgRow } from "./orgs-table"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type OrgSettingsPayload = {
  settings?: {
    timeZone: string
    offersOceanLessons: boolean
  } | null
}

const US_TIME_ZONES = [
  { value: "America/New_York", label: "Eastern (America/New_York)" },
  { value: "America/Chicago", label: "Central (America/Chicago)" },
  { value: "America/Denver", label: "Mountain (America/Denver)" },
  { value: "America/Phoenix", label: "Arizona (America/Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific (America/Los_Angeles)" },
  { value: "America/Anchorage", label: "Alaska (America/Anchorage)" },
  { value: "America/Adak", label: "Aleutian (America/Adak)" },
  { value: "Pacific/Honolulu", label: "Hawaii (Pacific/Honolulu)" },
]

async function apiGetOrg(orgId: string): Promise<OrgSettingsPayload> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}`, {
    method: "GET",
    cache: "no-store",
  })

  const json = (await res.json()) as ApiResponse<OrgSettingsPayload>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiUpdateOrg(
  orgId: string,
  input: { name?: string; slug?: string; timeZone?: string; offersOceanLessons?: boolean }
) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<OrgRow>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

export function OrgDialogs({
  editOrg,
  onCloseEdit,
  onUpdated,
}: {
  editOrg: OrgRow | null
  onCloseEdit: () => void
  onUpdated: (org: OrgRow) => void
}) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [timeZone, setTimeZone] = useState(US_TIME_ZONES[0]?.value ?? "America/Chicago")
  const [offersOceanLessons, setOffersOceanLessons] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [submittingEdit, setSubmittingEdit] = useState(false)

  useEffect(() => {
    if (!editOrg) return
    setName(editOrg.name ?? "")
    setSlug(editOrg.slug ?? "")
    setTimeZone(editOrg.settings?.timeZone ?? "America/Chicago")
    setOffersOceanLessons(Boolean(editOrg.settings?.offersOceanLessons))
    setLoadingSettings(true)
    apiGetOrg(editOrg.id)
      .then((data) => {
        if (data.settings?.timeZone) setTimeZone(data.settings.timeZone)
        if (typeof data.settings?.offersOceanLessons === "boolean") {
          setOffersOceanLessons(data.settings.offersOceanLessons)
        }
      })
      .catch(() => null)
      .finally(() => setLoadingSettings(false))
  }, [editOrg])

  async function onSubmitEdit() {
    if (!editOrg) return
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    setSubmittingEdit(true)
    try {
      const updated = await apiUpdateOrg(editOrg.id, {
        name: name.trim(),
        slug: slug.trim() || undefined,
        timeZone,
        offersOceanLessons,
      })
      onUpdated(updated)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update org")
    } finally {
      setSubmittingEdit(false)
    }
  }

  return (
    <Dialog open={!!editOrg} onOpenChange={(v) => (!v ? onCloseEdit() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit organization</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="org-slug"
              autoComplete="off"
              className="font-mono focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
            />
            <div className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and hyphens
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-timezone">Time zone</Label>
            <select
              id="org-timezone"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              disabled={loadingSettings}
            >
              {US_TIME_ZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground">US time zones only</div>
          </div>

          <div className="space-y-2">
            <Label>Ocean Lessons</Label>
            <ToggleGroup
              type="single"
              value={offersOceanLessons ? "on" : "off"}
              onValueChange={(value) => {
                if (!value) return
                setOffersOceanLessons(value === "on")
              }}
              disabled={loadingSettings}
            >
              <ToggleGroupItem value="on">On</ToggleGroupItem>
              <ToggleGroupItem value="off">Off</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCloseEdit} type="button" disabled={submittingEdit}>
            Cancel
          </Button>
          <Button onClick={onSubmitEdit} type="button" disabled={submittingEdit}>
            {submittingEdit ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
