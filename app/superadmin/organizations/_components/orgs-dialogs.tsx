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
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

async function apiUpdateOrg(orgId: string, input: { name?: string; slug?: string }) {
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
  const [submittingEdit, setSubmittingEdit] = useState(false)

  useEffect(() => {
    if (!editOrg) return
    setName(editOrg.name ?? "")
    setSlug(editOrg.slug ?? "")
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
