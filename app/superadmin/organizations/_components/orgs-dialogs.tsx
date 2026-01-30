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
import { slugifyOrgName } from "@/lib/utils/slug"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type ZodIssue = {
  code?: string
  path?: Array<string | number>
  message?: string
  format?: string
  pattern?: string
}

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
  const res = await fetch(`/api/super-admin/organizations/${orgId}`, {
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
  const res = await fetch(`/api/super-admin/organizations/${orgId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<OrgRow>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

function getOrgUpdateErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Failed to update org"

  try {
    const parsed = JSON.parse(error.message) as ZodIssue[]
    if (Array.isArray(parsed)) {
      const slugIssue = parsed.find((issue) => issue.path?.includes("slug"))
      if (slugIssue?.code === "invalid_format" || slugIssue?.pattern) {
        return "Slug can only contain lowercase letters, numbers, and hyphens"
      }
    }
  } catch {
    // ignore JSON parse errors
  }

  if (error.message.includes("/^[a-z0-9-]+$/")) {
    return "Slug can only contain lowercase letters, numbers, and hyphens"
  }

  return error.message
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
  const slugPreview = slugifyOrgName(name.trim())
  const [timeZone, setTimeZone] = useState(US_TIME_ZONES[0]?.value ?? "America/Chicago")
  const [offersOceanLessons, setOffersOceanLessons] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [submittingEdit, setSubmittingEdit] = useState(false)

  useEffect(() => {
    if (!editOrg) return
    setName(editOrg.name ?? "")
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
        slug: slugPreview || undefined,
        timeZone,
        offersOceanLessons,
      })
      onUpdated(updated)
    } catch (e) {
      toast.error(getOrgUpdateErrorMessage(e))
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
              className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slugPreview}
              readOnly
              tabIndex={-1}
              aria-label="Slug preview"
              className="h-10 bg-muted/30 font-mono text-xs text-foreground/80 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and hyphens
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-timezone">Time zone</Label>
            <select
              id="org-timezone"
              className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
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
            <Label>Ocean lessons</Label>
            <div className="text-xs text-muted-foreground">
              Allow ocean lessons to be booked for this organization
            </div>
            <ToggleGroup
              type="single"
              value={offersOceanLessons ? "on" : "off"}
              onValueChange={(value) => {
                if (!value) return
                setOffersOceanLessons(value === "on")
              }}
              disabled={loadingSettings}
            >
              <ToggleGroupItem value="on">Enabled</ToggleGroupItem>
              <ToggleGroupItem value="off">Disabled</ToggleGroupItem>
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
