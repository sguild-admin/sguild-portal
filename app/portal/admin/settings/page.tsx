import { requireClerkUserId, requireClerkOrgId } from '@/lib/clerk'
import { getActorFromClerk } from '@/modules/auth/auth.usecases'
import { getOrgSettings } from '@/modules/settings/settings.usecases'

export default async function Page() {
  const clerkUserId = await requireClerkUserId()
  const clerkOrgId = await requireClerkOrgId()

  const actor = await getActorFromClerk({ clerkUserId, clerkOrgId })

  const settings = await getOrgSettings(actor, clerkOrgId)

  return (
    <div>
      <h1>Organization Settings</h1>
      <div>Time zone: {settings.timeZone ?? 'Not set'}</div>
      <div>Ocean lessons: {settings.oceanLessons ? 'Yes' : 'No'}</div>
    </div>
  )
}
