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

export type RoleDialogData = {
  memberId: string
  name: string
  role: "owner" | "admin" | "coach" | "member"
}

export function RoleDialog({
  open,
  data,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean
  data: RoleDialogData | null
  onOpenChange: (v: boolean) => void
  onSubmit: (role: RoleDialogData["role"]) => void
  submitting?: boolean
}) {
  const [role, setRole] = useState<RoleDialogData["role"]>("admin")

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
          <Label htmlFor="role">Role for {data?.name ?? ""}</Label>
          <select
            id="role"
            className="h-10 w-full rounded-md border px-3 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleDialogData["role"])}
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
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
