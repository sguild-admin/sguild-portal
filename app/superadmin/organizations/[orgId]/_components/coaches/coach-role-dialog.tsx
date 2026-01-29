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
import { Input } from "@/components/ui/input"

export type CoachRoleDialogData = {
  memberId: string
  name: string
  role: "member"
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
  const [role, setRole] = useState<CoachRoleDialogData["role"]>("member")

  useEffect(() => {
    if (!data) return
    setRole(data.role)
  }, [data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Change role</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="coach-role" className="text-sm font-medium">
              Role
            </Label>
            <Input
              id="coach-role"
              value="Member"
              readOnly
              className="h-10 border-border/60 bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <p className="pl-1 text-xs text-muted-foreground">Coach tools are enabled via profile</p>
          </div>
        </div>

        <DialogFooter className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={submitting}
          >
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
