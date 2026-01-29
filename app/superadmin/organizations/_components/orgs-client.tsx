"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { OrgsTable, type OrgRow } from "@/app/superadmin/organizations/_components/orgs-table"
import { CreateOrgDialog } from "@/app/superadmin/organizations/_components/create-org-dialog"
import { OrgDialogs } from "@/app/superadmin/organizations/_components/orgs-dialogs"
import { SuperAdminBreadcrumbs } from "@/app/superadmin/_components/superadmin-breadcrumbs"
import { PageScaffold } from "@/components/shell/page-scaffold"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw } from "lucide-react"

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

async function apiDeleteOrg(orgId: string) {
  const res = await fetch(`/api/super-admin/orgs/${orgId}`, { method: "DELETE" })
  const json = (await res.json()) as ApiResponse<{ id: string }>
  if (!json.ok) throw json.error
  return json.data
}

type OrgCounts = {
  admins: number
  pendingInvites: number
}

async function apiGetAdminsCount(orgId: string): Promise<number> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/admins`, {
    method: "GET",
    cache: "no-store",
  })
  const json = (await res.json()) as ApiResponse<unknown[]>
  if (!json.ok || !Array.isArray(json.data)) return 0
  return json.data.length
}

async function apiGetPendingInvitesCount(orgId: string): Promise<number> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/invitations`, {
    method: "GET",
    cache: "no-store",
  })
  const json = (await res.json()) as ApiResponse<any[]>
  if (!json.ok || !Array.isArray(json.data)) return 0
  return json.data.filter((inv) => inv?.status === "PENDING").length
}

export function OrgsClient({ initialOrgs }: { initialOrgs: OrgRow[] }) {
  const router = useRouter()
  const [orgs, setOrgs] = useState<OrgRow[]>(initialOrgs)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOrg, setEditOrg] = useState<OrgRow | null>(null)
  const [counts, setCounts] = useState<Record<string, OrgCounts | undefined>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const next = await apiGetOrgs()
      setOrgs(next.items)
    } catch {
      toast.error("Failed to refresh organizations")
    }
  }, [])

  const refreshCounts = useCallback(async (items: OrgRow[]) => {
    try {
      const entries = await Promise.all(
        items.map(async (org) => {
          const [admins, pendingInvites] = await Promise.all([
            apiGetAdminsCount(org.id),
            apiGetPendingInvitesCount(org.id),
          ])
          return [org.id, { admins, pendingInvites } as OrgCounts] as const
        })
      )

      setCounts((prev) => {
        const next = { ...prev }
        for (const [id, value] of entries) next[id] = value
        return next
      })
    } catch {
      toast.error("Failed to load org counts")
    }
  }, [])

  const orgCount = useMemo(() => orgs.length, [orgs])

  useEffect(() => {
    if (!orgs.length) return
    refreshCounts(orgs)
  }, [orgs, refreshCounts])

  return (
    <PageScaffold
      title="Organizations"
      subtitle={
        <span className="text-sm text-muted-foreground">
          Manage organizations and admins
          <span className="ml-2 tabular-nums">({orgCount})</span>
        </span>
      }
      breadcrumb={
        <SuperAdminBreadcrumbs
          items={[{ label: "Super Admin", href: "/superadmin" }, { label: "Organizations" }]}
        />
      }
      actions={
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={refresh} type="button">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="default" onClick={() => setCreateOpen(true)} type="button">
            Create org
          </Button>
        </>
      }
    >
      <OrgsTable
        orgs={orgs}
        counts={counts}
        onRowClick={(org) => router.push(`/superadmin/organizations/${encodeURIComponent(org.id)}`)}
        onTabClick={(org, tab) =>
          router.push(`/superadmin/organizations/${encodeURIComponent(org.id)}?tab=${tab}`)
        }
        onEdit={(org) => setEditOrg(org)}
        onDelete={async (org) => {
          setDeletingId(org.id)
          try {
            await apiDeleteOrg(org.id)
            setOrgs((prev) => prev.filter((o) => o.id !== org.id))
            toast.success("Organization deleted")
          } catch {
            toast.error("Failed to delete org")
          } finally {
            setDeletingId(null)
          }
        }}
        onCreate={() => setCreateOpen(true)}
        deletingId={deletingId}
      />

      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          setCreateOpen(false)
          toast.success("Organization created")
          setOrgs((prev) => [created as any, ...prev])
        }}
      />

      <OrgDialogs
        editOrg={editOrg}
        onCloseEdit={() => setEditOrg(null)}
        onUpdated={(updated: OrgRow) => {
          setEditOrg(null)
          setOrgs((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)))
          toast.success("Organization updated")
        }}
      />
    </PageScaffold>
  )
}
