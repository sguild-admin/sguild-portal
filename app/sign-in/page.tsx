// app/sign-in/page.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { SignInCard } from "./sign-in-card"

export default async function SignInPage() {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })

  if (session?.session) redirect("/portal")

  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <SignInCard />
    </main>
  )
}
