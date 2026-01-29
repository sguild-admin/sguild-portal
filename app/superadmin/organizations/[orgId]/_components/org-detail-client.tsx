"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDeleteDialog } from "@/app/superadmin/_components/confirm-delete-dialog"
import { SuperAdminBreadcrumbs } from "@/app/superadmin/_components/superadmin-breadcrumbs"
import { OrgDialogs } from "@/app/superadmin/organizations/_components/orgs-dialogs"
import { AdminsTab, type AdminItem } from "@/app/superadmin/organizations/[orgId]/_components/admins/admins-tab"
import { CoachesTab, type CoachItem } from "@/app/superadmin/organizations/[orgId]/_components/coaches/coaches-tab"
import { InvitationsTab, type InviteItem } from "@/app/superadmin/organizations/[orgId]/_components/invites/invitations-tab"
import { InviteDialog } from "@/app/superadmin/organizations/[orgId]/_components/invites/invite-dialog"
import { InviteLinkDialog } from "@/app/superadmin/organizations/[orgId]/_components/invites/invite-link-dialog"
import { Clock, Trash2, Waves } from "lucide-react"
import { PageScaffold } from "@/components/shell/page-scaffold"

export type OrgDto = {
  id: string
  name: string
  slug?: string | null
  createdAt?: unknown
  _count?: { members: number }
  settings?: {
    timeZone: string
    offersOceanLessons: boolean
  } | null
}

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string; code?: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type TabKey = "admins" | "coaches" | "invitations"

type InvitePrefill = {
  email: string
  role: "admin" | "owner" | "coach"
}

async function apiGetAdmins(orgId: string): Promise<AdminItem[]> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/admins`, {
    method: "GET",
    cache: "no-store",
  })
  const json = (await res.json()) as ApiResponse<AdminItem[]>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiGetInvites(orgId: string): Promise<InviteItem[]> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/invitations`, {
    method: "GET",
    cache: "no-store",
  })
  const json = (await res.json()) as ApiResponse<InviteItem[]>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

async function apiGetCoaches(orgId: string): Promise<CoachItem[]> {
  const res = await fetch(`/api/super-admin/orgs/${orgId}/coaches`, {
    method: "GET",
    cache: "no-store",
  })
  const json = (await res.json()) as ApiResponse<CoachItem[]>
  if (!json.ok) throw new Error(json.error)
  return json.data
}

export function OrgDetailClient({ org }: { org: OrgDto }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabFromUrl = useMemo(() => {
    const value = searchParams.get("tab")
    if (value === "admins" || value === "coaches" || value === "invitations") return value
    return null
  }, [searchParams])

  const [tab, setTab] = useState<TabKey>(tabFromUrl ?? "admins")

  const [admins, setAdmins] = useState<AdminItem[]>([])
  const [coaches, setCoaches] = useState<CoachItem[]>([])
  const [invites, setInvites] = useState<InviteItem[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [loadingCoaches, setLoadingCoaches] = useState(false)
  const [loadingInvites, setLoadingInvites] = useState(false)

  const [editOrg, setEditOrg] = useState<OrgDto | null>(null)
  const [deletingOrg, setDeletingOrg] = useState(false)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [invitePrefill, setInvitePrefill] = useState<InvitePrefill | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const refreshAdmins = useCallback(async () => {
    setLoadingAdmins(true)
    try {
      const data = await apiGetAdmins(org.id)
      setAdmins(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load admins")
    } finally {
      setLoadingAdmins(false)
    }
  }, [org.id])

  const refreshInvites = useCallback(async () => {
    setLoadingInvites(true)
    try {
      const data = await apiGetInvites(org.id)
      setInvites(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load invites")
    } finally {
      setLoadingInvites(false)
    }
  }, [org.id])

  const refreshCoaches = useCallback(async () => {
    setLoadingCoaches(true)
    try {
      const data = await apiGetCoaches(org.id)
      setCoaches(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load coaches")
    } finally {
      setLoadingCoaches(false)
    }
  }, [org.id])

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== tab) setTab(tabFromUrl)
    refreshAdmins()
    refreshCoaches()
    refreshInvites()
  }, [refreshAdmins, refreshCoaches, refreshInvites, tabFromUrl, tab])

  const pendingInvites = useMemo(
    () => invites.filter((inv) => inv.status === "PENDING").length,
    [invites]
  )

  async function onDeleteOrg() {
    setDeletingOrg(true)
    try {
      await fetch(`/api/super-admin/orgs/${org.id}`, { method: "DELETE" })
      router.replace("/superadmin/organizations")
      router.refresh()
    } catch {
      toast.error("Failed to delete org")
    } finally {
      setDeletingOrg(false)
    }
  }

  return (
    <PageScaffold
      title={org.name}
      titleClassName="text-3xl font-semibold leading-tight"
      subtitle={
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 font-mono text-xs text-foreground/70">
            {org.slug ?? "—"}
          </div>
          {org.settings?.timeZone ? (
            <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 text-xs text-foreground/70">
              <Clock className="h-3.5 w-3.5" />
              {org.settings.timeZone}
            </div>
          ) : null}
          {org.settings?.offersOceanLessons ? (
            <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 text-xs text-foreground/70">
              <Waves className="h-3.5 w-3.5" />
              Ocean Lessons
            </div>
          ) : null}
        </div>
      }
      breadcrumb={
        <SuperAdminBreadcrumbs
          items={[
            { label: "Super Admin", href: "/superadmin" },
            { label: "Organizations", href: "/superadmin/organizations" },
            { label: org.name },
          ]}
        />
      }
      actions={
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" onClick={() => setEditOrg(org)}>
            Settings
          </Button>

          <ConfirmDeleteDialog
            title="Delete organization"
            description="This permanently deletes the organization and its data."
            confirmLabel="Delete"
            confirmLoading={deletingOrg}
            onConfirm={onDeleteOrg}
          >
            <span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      aria-label="Delete organization"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </ConfirmDeleteDialog>
        </div>
      }
    >
      <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
        <div className="mb-3">
          <TabsList>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              Invitations
              {pendingInvites > 0 ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-foreground/70">
                  {pendingInvites}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="admins">
          <AdminsTab
            orgId={org.id}
            admins={admins}
            loading={loadingAdmins}
            onRefresh={refreshAdmins}
          />
        </TabsContent>

        <TabsContent value="coaches">
          <CoachesTab
            orgId={org.id}
            coaches={coaches}
            loading={loadingCoaches}
            onRefresh={refreshCoaches}
            onInviteRequested={(email: string) => {
              setInvitePrefill({ email, role: "coach" })
              setInviteDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationsTab
            orgId={org.id}
            activeTab={tab}
            invites={invites}
            loading={loadingInvites}
            onRefresh={refreshInvites}
            onInviteUrl={setInviteUrl}
            onInviteDialogOpenChange={(open) => {
              if (!open) setInvitePrefill(null)
              setInviteDialogOpen(open)
            }}
            onInvitePrefillChange={setInvitePrefill}
          />
        </TabsContent>
      </Tabs>

      <InviteDialog
        orgId={org.id}
        open={inviteDialogOpen}
        prefill={invitePrefill}
        onOpenChange={(open) => {
          if (!open) setInvitePrefill(null)
          setInviteDialogOpen(open)
        }}
        onCreated={(created) => {
          setInviteUrl(created.inviteUrl)
          setInvitePrefill(null)
          refreshInvites()
        }}
      />

      <InviteLinkDialog
        open={!!inviteUrl}
        inviteUrl={inviteUrl ?? ""}
        onOpenChange={(v) => {
          if (!v) setInviteUrl(null)
        }}
      />

      <OrgDialogs
        editOrg={editOrg}
        onCloseEdit={() => setEditOrg(null)}
        onUpdated={() => {
          setEditOrg(null)
          router.refresh()
        }}
      />
    </PageScaffold>
  )
}
