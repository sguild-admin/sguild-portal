// app/sign-in/[[...sign-in]]/page.tsx
// Clerk sign-in page.
import { SignIn } from "@clerk/nextjs"

export default async function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="app-container grid place-items-center">
        <div className="app-card p-6">
          <SignIn afterSignInUrl="/portal" />
        </div>
      </div>
    </main>
  )
}
