// app/sign-up/[[...sign-up]]/page.tsx
// Clerk sign-up page.
import { SignUp } from "@clerk/nextjs"

export default async function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="app-container grid place-items-center">
        <div className="app-card p-6">
          <SignUp path="/sign-up" routing="path" afterSignUpUrl="/portal" afterSignInUrl="/portal" />
        </div>
      </div>
    </main>
  )
}
