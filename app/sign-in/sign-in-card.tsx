"use client"

import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/auth-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Mode = "sign-in" | "sign-up"

export function SignInCard() {
  const [mode, setMode] = useState<Mode>("sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === "sign-in") {
        await authClient.signIn.email({ email, password })
      } else {
        await authClient.signUp.email({
          name: name.trim() || "User",
          email,
          password,
          callbackURL: "/session",
        })
      }
      window.location.href = "/session"
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed")
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle() {
    setBusy(true)
    try {
      await authClient.signIn.social({ provider: "google" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign in failed")
      setBusy(false)
    }
  }

  function onInviteSubmit() {
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

    window.location.href = `/invite?token=${encodeURIComponent(token)}`
  }

  return (
    <div className="w-full rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "sign-in" ? "Use email and password" : "Email and password required"}
          </p>
        </div>

        <button
          type="button"
          className="text-sm text-muted-foreground underline underline-offset-4"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          disabled={busy}
        >
          {mode === "sign-in" ? "Create account" : "Sign in"}
        </button>
      </div>

      <form onSubmit={onEmailSubmit} className="mt-6 grid gap-3">
        {mode === "sign-up" ? (
          <div className="grid gap-1">
            <label className="text-sm">Name</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        ) : null}

        <div className="grid gap-1">
          <label className="text-sm">Email</label>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm">Password</label>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            type="password"
          />
        </div>

        <Button type="submit" disabled={busy}>
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={onGoogle} disabled={busy}>
          Continue with Google
        </Button>
      </form>

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
    </div>
  )
}
