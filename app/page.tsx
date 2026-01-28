// app/page.tsx
import { redirect } from "next/navigation"
import { AppError } from "@/lib/http/errors"
import { requireSession } from "@/lib/auth/guards"
import { getRequestHeaders } from "@/lib/auth/next-request-headers"

export default async function HomePage() {
  const reqHeaders = await getRequestHeaders()

  try {
    await requireSession(reqHeaders)
    redirect("/session")
  } catch (err) {
    if (err instanceof AppError && err.code === "UNAUTHENTICATED") {
      redirect("/sign-in")
    }
    throw err
  }
}
