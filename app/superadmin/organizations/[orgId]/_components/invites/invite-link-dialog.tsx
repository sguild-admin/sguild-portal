"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function InviteLinkDialog({
  open,
  inviteUrl,
  onOpenChange,
}: {
  open: boolean
  inviteUrl: string | null
  onOpenChange: (v: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-slate-900 shadow-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite link</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input value={inviteUrl ?? ""} readOnly />
          <div className="text-xs text-muted-foreground">
            This link is only shown once. Copy it now.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Close
          </Button>
          <Button
            onClick={async () => {
              if (!inviteUrl) return
              await navigator.clipboard.writeText(inviteUrl)
            }}
            type="button"
          >
            Copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
