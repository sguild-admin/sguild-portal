// app/session/no-access/_components/no-access-screen.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { SignOutButton } from "@/components/common/sign-out-button"

export function NoAccessScreen() {
  const router = useRouter()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const onInviteSubmit = () => {
    const value = inviteLink.trim()
    if (!value) {
      toast.error("Paste an invite link or token")
      return
    }

    let token = value
    try {
      if (value.includes("token=")) {
        const url = new URL(value)
        token = url.searchParams.get("token") ?? ""
      }
    } catch {
      // allow raw token input
    }

    if (!token) {
      toast.error("Invalid invite link")
      return
    }

    router.push(`/invite?token=${encodeURIComponent(token)}`)
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No organization access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Your account is signed in, but it is not a member of any organization yet
          </div>
          <div className="text-sm text-muted-foreground">
            Have an invite link?{" "}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => setInviteOpen(true)}
            >
              Click here
            </button>
          </div>
          <SignOutButton variant="destructive">Sign out</SignOutButton>
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle>Paste invite link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Invite link or token</label>
            <input
              className="h-10 rounded-md border border-border/60 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
              placeholder="https://app.example.com/invite?token=..."
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              autoComplete="off"
            />
            <p className="pl-1 text-xs text-muted-foreground">
              We’ll route you to the invite once you paste it.
            </p>
          </div>
          <DialogFooter className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="button" onClick={onInviteSubmit}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
