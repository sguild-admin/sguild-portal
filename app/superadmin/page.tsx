import { headers } from "next/headers"
import { superAdminService } from "@/modules/super-admin/super-admin.service"
import { OrgsClient } from "./_components/orgs-client"

export const dynamic = "force-dynamic"

export default async function SuperAdminPage() {
  const h = await headers()
  const initial = await superAdminService.listOrgs(h, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Super Admin</h1>
        <p className="text-sm text-muted-foreground">Organizations and admin invitations</p>
      </div>

      <OrgsClient initialOrgs={initial.items} />
    </div>
  )
}
