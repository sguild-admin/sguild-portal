import { headers } from "next/headers"
import { getBaseUrl } from "@/lib/http/url"
import { OrgsTable } from "./_components/orgs-table"
import { CreateOrgDialog } from "./_components/create-org-dialog"
import { InviteAdminDialog } from "./_components/invite-admin-dialog"

type OrgsResponse = {
  ok: true
  data: {
    items: Array<{ id: string; name: string; slug?: string | null; createdAt?: string | null }>
    total: number
    limit: number
    offset: number
  }
}

type OrgsError = { ok: false; error: string }

export default async function SuperAdminPage() {
  const h = await headers()
  const baseUrl = getBaseUrl(h)

  const res = await fetch(`${baseUrl}/api/super-admin/orgs`, {
    headers: { cookie: h.get("cookie") ?? "" },
    cache: "no-store",
  })

  const json = (await res.json()) as OrgsResponse | OrgsError
  const items = json.ok ? json.data.items : []
  const error = json.ok ? null : json.error

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Super Admin</h1>
          <p className="text-sm text-muted-foreground">Cross-org administration</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateOrgDialog />
          <InviteAdminDialog />
        </div>
      </header>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <OrgsTable items={items} />
    </main>
  )
}
