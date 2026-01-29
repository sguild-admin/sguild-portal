"use client"

import { useEffect, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type RoleDialogData = {
  memberId: string
  userId: string
  name: string
  role: "owner" | "admin"
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
  const roleDescriptionId = useId()

  const roleDescriptions: Record<RoleDialogData["role"], string> = {
    owner: "Full access including billing and org settings",
    admin: "Manage staff, schedules, clients",
  }

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
            <Label htmlFor="role" className="text-sm font-medium">
              Role for {data?.name ?? ""} <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as RoleDialogData["role"])}>
              <SelectTrigger
                id="role"
                className="h-10 border-border/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
                aria-describedby={roleDescriptionId}
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="owner"
                  text="Owner"
                  description="Full access including billing and org settings"
                />
                <SelectItem
                  value="admin"
                  text="Admin"
                  description="Manage staff, schedules, clients"
                />
              </SelectContent>
            </Select>
            <p id={roleDescriptionId} className="pl-1 text-xs text-muted-foreground">
              {roleDescriptions[role]}
            </p>
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
