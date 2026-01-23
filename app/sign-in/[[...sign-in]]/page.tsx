import { SignIn } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const { userId } = await auth()
  if (userId) redirect("/portal")

  return (
    <main className="min-h-screen grid place-items-center">
      <SignIn afterSignInUrl="/portal" />
    </main>
  )
}
