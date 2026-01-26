"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { OrgsTable, type OrgRow } from "./orgs-table"
import { CreateOrgDialog } from "./create-org-dialog"
import { InviteAdminDialog } from "./invite-admin-dialog"

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: unknown }
type ApiResponse<T> = ApiOk<T> | ApiFail

type OrgListPayload = {
  items: OrgRow[]
  total: number
  limit: number
  offset: number
}

async function apiGetOrgs(): Promise<OrgListPayload> {
  const res = await fetch("/api/super-admin/orgs", { method: "GET", cache: "no-store" })
  const json = (await res.json()) as ApiResponse<OrgListPayload>

  if (!json.ok) throw json.error
  return json.data
}

export function OrgsClient({ initialOrgs }: { initialOrgs: OrgRow[] }) {
  const [orgs, setOrgs] = useState<OrgRow[]>(initialOrgs)
  const [inviteOrg, setInviteOrg] = useState<OrgRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const next = await apiGetOrgs()
      setOrgs(next.items)
    } catch {
      toast.error("Failed to refresh organizations")
    }
  }, [])

  const orgCount = useMemo(() => orgs.length, [orgs])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{orgCount} orgs</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} type="button">
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} type="button">
            Create org
          </Button>
        </div>
      </div>

      <OrgsTable orgs={orgs} onInviteAdmin={(org) => setInviteOrg(org)} />

      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          setCreateOpen(false)
          toast.success("Organization created")
          setOrgs((prev) => [created, ...prev])
        }}
      />

      <InviteAdminDialog
        org={inviteOrg}
        open={!!inviteOrg}
        onOpenChange={(v) => {
          if (!v) setInviteOrg(null)
        }}
        onInvited={() => {
          toast.success("Invitation created")
          setInviteOrg(null)
        }}
      />
    </div>
  )
}
