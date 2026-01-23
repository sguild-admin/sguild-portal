import { requireClerkUserId, requireClerkOrgId } from '@/lib/clerk'
import { getActorFromClerk } from '@/modules/auth/auth.usecases'
import { listCoaches } from '@/modules/coaches/coaches.usecases'

export default async function Page() {
  const clerkUserId = await requireClerkUserId()
  const clerkOrgId = await requireClerkOrgId()

  const actor = await getActorFromClerk({ clerkUserId, clerkOrgId })

  const coaches = await listCoaches(actor, clerkOrgId)

  return (
    <div>
      <h1>Coaches</h1>
      <ul>
        {coaches.map((c: unknown) => {
          const m = c as { id?: string; clerkUserId?: string; status?: string }
          return <li key={m.id}>{m.clerkUserId} — {m.status}</li>
        })}
      </ul>
    </div>
  )
}
