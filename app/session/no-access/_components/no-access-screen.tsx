// app/session/no-access/_components/no-access-screen.tsx
"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NoAccessScreen() {
  const router = useRouter()

  const onSignOut = async () => {
    await authClient.signOut()
    router.replace("/sign-in")
    router.refresh()
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
          <Button variant="destructive" onClick={onSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
