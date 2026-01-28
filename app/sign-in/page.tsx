// app/sign-in/page.tsx
import { redirectIfSignedIn } from "@/lib/auth/redirects"
import { SignInCard } from "./sign-in-card"

export default async function SignInPage() {
  await redirectIfSignedIn("/session")

  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <SignInCard />
    </main>
  )
}
