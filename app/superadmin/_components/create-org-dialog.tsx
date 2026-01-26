"use client"

import { useMemo, useState } from "react"
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
import { slugifyOrgName } from "@/lib/utils/slug"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: unknown }
type ApiResponse<T> = ApiOk<T> | ApiFail

export type OrgCreated = {
  id: string
  name: string
  slug?: string | null
  createdAt?: string | Date | null
}

async function apiCreateOrg(input: { name: string }): Promise<OrgCreated> {
  const res = await fetch("/api/super-admin/orgs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as ApiResponse<OrgCreated>
  if (!json.ok) throw json.error
  return json.data
}

export function CreateOrgDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (org: OrgCreated) => void
}) {
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const slugPreview = useMemo(() => slugifyOrgName(name), [name])

  async function onSubmit() {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    setSubmitting(true)
    try {
      const created = await apiCreateOrg({ name: name.trim() })
      setName("")
      onCreated(created)
    } catch {
      toast.error("Failed to create org")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-slate-900 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sguild Swim Dallas"
              autoComplete="off"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Slug: {slugPreview || " "}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} type="button" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
