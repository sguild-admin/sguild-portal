"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  const nameRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const slugPreview = useMemo(() => slugifyOrgName(trimmedName), [trimmedName])
  const canSubmit = trimmedName.length > 0 && !submitting

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => nameRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  function close() {
    if (submitting) return
    onOpenChange(false)
  }

  async function onSubmit() {
    if (!trimmedName) {
      toast.error("Name is required")
      return
    }

    setSubmitting(true)
    try {
      const created = await apiCreateOrg({ name: trimmedName })
      setName("")
      onCreated(created)
    } catch {
      toast.error("Failed to create org")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle>Create organization</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Slug is generated automatically from the name
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              ref={nameRef}
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sguild Swim Dallas"
              autoComplete="off"
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit()
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Slug</Label>
            <Input
              value={slugPreview || ""}
              readOnly
              tabIndex={-1}
              aria-label="Slug preview"
              className="font-mono text-xs text-foreground/80 bg-muted/30"
            />
            <div className="text-xs text-muted-foreground">
              Lowercase, numbers, hyphens
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={close} type="button" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} type="button" disabled={!canSubmit}>
            {submitting ? "Creating..." : "Create organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
