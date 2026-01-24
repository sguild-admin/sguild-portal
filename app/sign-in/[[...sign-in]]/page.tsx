import { SignIn } from "@clerk/nextjs"
export default async function Page() {
  return (
    <main className="min-h-screen grid place-items-center">
      <SignIn afterSignInUrl="/portal" />
    </main>
  )
}
