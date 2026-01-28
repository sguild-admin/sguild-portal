// app/session/org-select/_components/org-select-screen.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useBootstrap } from "@/components/shell/bootstrap-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type OrgSummary = { id: string; name: string; slug: string }

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: { message?: string } }
type ApiResp<T> = ApiOk<T> | ApiFail

async function apiGet<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store", credentials: "include" })
  if (!r.ok) {
    if (r.status === 401) throw new Error("UNAUTHENTICATED")
    throw new Error(`HTTP_${r.status}`)
  }
  const json = (await r.json()) as ApiResp<T>
  if (!json.ok) throw new Error(json.error?.message ?? "Request failed")
  return json.data
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    if (r.status === 401) throw new Error("UNAUTHENTICATED")
    throw new Error(`HTTP_${r.status}`)
  }
  const json = (await r.json()) as ApiResp<T>
  if (!json.ok) throw new Error(json.error?.message ?? "Request failed")
  return json.data
}

export function OrgSelectScreen() {
  const router = useRouter()
  const boot = useBootstrap()

  const [orgs, setOrgs] = useState<OrgSummary[] | null>(null)
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [orgsError, setOrgsError] = useState<string | null>(null)
  const [submittingOrgId, setSubmittingOrgId] = useState<string | null>(null)

  const activeOrgId = useMemo(
    () => boot.data?.activeOrg?.id ?? boot.data?.session?.activeOrganizationId ?? null,
    [boot.data]
  )

  const loadOrgs = useCallback(async () => {
    setLoadingOrgs(true)
    setOrgsError(null)

    try {
      const list = await apiGet<OrgSummary[]>("/api/organizations")

      if (list.length === 0) {
        router.replace("/session/no-access")
        router.refresh()
        return
      }

      setOrgs(list)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load organizations"

      if (msg === "UNAUTHENTICATED") {
        router.replace("/sign-in")
        router.refresh()
        return
      }

      setOrgs(null)
      setOrgsError(msg)
    } finally {
      setLoadingOrgs(false)
    }
  }, [router])

  useEffect(() => {
    if (boot.loading || !boot.data) return

    if (boot.data.superAdmin) {
      router.replace("/superadmin")
      return
    }

    if (boot.data.activeOrg) {
      router.replace("/portal")
      return
    }

    loadOrgs()
  }, [boot.loading, boot.data, router, loadOrgs])

  const onSelectOrg = async (orgId: string) => {
    try {
      setSubmittingOrgId(orgId)
      await apiPost("/api/organizations/active", { orgId })
      await boot.refresh()
      router.replace("/portal")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to set active organization")
    } finally {
      setSubmittingOrgId(null)
    }
  }

  const onRetry = async () => {
    await boot.refresh()
    await loadOrgs()
  }

  if (boot.loading || !boot.data) return null

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select an organization</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">Choose where you want to work</div>
          <Separator />

          {loadingOrgs ? <div className="text-sm text-muted-foreground">Loading</div> : null}

          {orgsError ? (
            <div className="space-y-3">
              <div className="text-sm">{orgsError}</div>
              <Button variant="secondary" onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : null}

          {orgs ? (
            <div className="space-y-2">
              {orgs.map((org) => {
                const isActive = activeOrgId === org.id
                const busy = submittingOrgId === org.id

                return (
                  <div key={org.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{org.name}</div>
                      <div className="truncate text-sm text-muted-foreground">{org.slug}</div>
                    </div>

                    <Button
                      variant={isActive ? "secondary" : "default"}
                      disabled={busy || isActive}
                      onClick={() => onSelectOrg(org.id)}
                    >
                      {isActive ? "Active" : busy ? "Setting" : "Select"}
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
