"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string; code?: string }

type AcceptState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string; code?: string }

export function InviteClient() {
  const router = useRouter()
  const search = useSearchParams()
  const token = useMemo(() => search.get("token") ?? "", [search])

  const [state, setState] = useState<AcceptState>({ status: "idle" })

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Missing invite token" })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: "loading" })

      try {
        const res = await fetch("/api/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        })

        const json = (await res.json()) as ApiOk<unknown> | ApiFail
        if (cancelled) return

        if (!json.ok) {
          setState({ status: "error", message: json.error, code: json.code })
          return
        }

        setState({ status: "success" })
      } catch (e) {
        if (cancelled) return
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Invite acceptance failed",
        })
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [token])

  const onSignIn = () => {
    const next = `/invite?token=${encodeURIComponent(token)}`
    router.replace(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  const onSignOut = async () => {
    try {
      await authClient.signOut()
      router.replace("/sign-in")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign out failed")
    }
  }

  const onGoSession = () => {
    router.replace("/portal")
    router.refresh()
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl items-center px-4">
      <button
        type="button"
        className="absolute right-4 top-4 text-xs text-muted-foreground underline underline-offset-4"
        onClick={onSignOut}
      >
        Sign out
      </button>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.status === "loading" ? (
            <div className="text-sm text-muted-foreground">Accepting invite…</div>
          ) : null}

          {state.status === "success" ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Invite accepted.</div>
              <Button onClick={onGoSession}>Continue</Button>
            </div>
          ) : null}

          {state.status === "error" ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{state.message}</div>
              {state.code === "UNAUTHENTICATED" ? (
                <Button onClick={onSignIn}>Sign in to accept</Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
