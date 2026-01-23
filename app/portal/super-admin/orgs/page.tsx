import { requireClerkUserId } from '@/lib/clerk'
import { getActorFromClerk } from '@/modules/auth/auth.usecases'
import { listOrgs } from '@/modules/superAdmin/superAdmin.usecases'

export default async function Page() {
  const clerkUserId = await requireClerkUserId()

  const actor = await getActorFromClerk({ clerkUserId })

  const orgs = await listOrgs(actor)

  return (
    <div>
      <h1>Organizations</h1>
      <ul>
        {orgs.map((o: unknown) => {
          const org = o as { id?: string; name?: string; clerkOrgId?: string }
          return <li key={org.id}>{org.name} ({org.clerkOrgId})</li>
        })}
      </ul>
    </div>
  )
}
