import { Suspense } from "react"
import { InviteClient } from "@/app/invite/_components/invite-client"

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading invite…</div>}>
      <InviteClient />
    </Suspense>
  )
}
