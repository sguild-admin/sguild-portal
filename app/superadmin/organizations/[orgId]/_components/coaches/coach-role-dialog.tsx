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
import { Label } from "@/components/ui/label"

export type CoachRoleDialogData = {
  memberId: string
  name: string
  role: "coach" | "member"
}

export function CoachRoleDialog({
  open,
  data,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean
  data: CoachRoleDialogData | null
  onOpenChange: (v: boolean) => void
  onSubmit: (role: CoachRoleDialogData["role"]) => void
  submitting?: boolean
}) {
  const [role, setRole] = useState<CoachRoleDialogData["role"]>("coach")

  useEffect(() => {
    if (!data) return
    setRole(data.role)
  }, [data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-slate-900 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="coach-role">Role for {data?.name ?? ""}</Label>
          <select
            id="coach-role"
            className="h-10 w-full rounded-md border px-3 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as CoachRoleDialogData["role"])}
          >
            <option value="coach">Coach</option>
            <option value="member">Member</option>
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(role)} type="button" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
