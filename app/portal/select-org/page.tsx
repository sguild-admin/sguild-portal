import { OrganizationSwitcher } from "@clerk/nextjs"
import AutoSetActiveOrg from "@/app/portal/_components/auto-set-org"
import { PageHeader } from "@/app/portal/_components/PageHeader"

export default function Page() {
  return (
    <div className="space-y-6">
      <AutoSetActiveOrg />
      <PageHeader
        title="Select an organization"
        subtitle="Choose the organization you want to use for the portal."
      />
      <div className="app-card max-w-xl p-6">
        <OrganizationSwitcher
          afterSelectOrganizationUrl="/portal"
          afterSelectPersonalUrl="/portal"
          afterCreateOrganizationUrl="/portal"
          hidePersonal
        />
      </div>
    </div>
  )
}
