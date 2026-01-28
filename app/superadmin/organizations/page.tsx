import { headers } from "next/headers"
import { superAdminService } from "@/modules/super-admin/super-admin.service"
import { OrgsClient } from "./_components/orgs-client"

export const dynamic = "force-dynamic"

export default async function SuperAdminOrganizationsPage() {
  const h = await headers()
  const initial = await superAdminService.listOrgs(h, {})

  return <OrgsClient initialOrgs={initial.items} />
}
