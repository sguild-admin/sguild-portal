import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { superAdminService } from "@/modules/super-admin/super-admin.service"
import { OrgDetailClient } from "./_components/org-detail-client"

export const dynamic = "force-dynamic"

export default async function SuperAdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ orgId?: string }>
}) {
  const { orgId } = await params
  if (!orgId) redirect("/superadmin/organizations")

  const h = await headers()

  try {
    const org = await superAdminService.getOrg(h, { orgId })
    return <OrgDetailClient org={org} />
  } catch {
    redirect("/superadmin/organizations")
  }
}
