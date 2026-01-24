// app/page.tsx
// Redirect to the portal entrypoint.
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/portal")
}
