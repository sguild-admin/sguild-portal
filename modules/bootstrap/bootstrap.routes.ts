import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { orgSettingsRepo } from "@/modules/org-settings/org-settings.repo"

function normalizeRoles(role: unknown): string[] {
  if (Array.isArray(role)) return role.map(String)
  if (typeof role === "string") return role.split(",").map((r) => r.trim()).filter(Boolean)
  return []
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return NextResponse.json({
        ok: true,
        data: {
          signedIn: false,
          user: null,
          session: null,
          activeOrg: null,
          roles: [],
          orgSettings: null,
        },
      })
    }

    const activeOrgId = session.session?.activeOrganizationId ?? null

    const roleRes = await auth.api.getActiveMemberRole({ headers: req.headers })
    const roleRaw = (roleRes as any)?.role ?? (roleRes as any)?.data?.role
    const roles = normalizeRoles(roleRaw)

    let activeOrg: any = null
    if (activeOrgId) {
      try {
        activeOrg = await auth.api.getFullOrganization({
          headers: req.headers,
          query: { organizationId: activeOrgId },
        })
      } catch {
        activeOrg = { id: activeOrgId }
      }
    }

    const orgSettings = activeOrgId ? await orgSettingsRepo.ensureDefaults(activeOrgId) : null

    return NextResponse.json({
      ok: true,
      data: {
        signedIn: true,
        user: { id: session.user.id, email: session.user.email, name: session.user.name },
        session: {
          id: session.session?.id,
          activeOrganizationId: activeOrgId,
          expiresAt: session.session?.expiresAt ?? null,
        },
        activeOrg,
        roles,
        orgSettings,
      },
    })
  } catch {
    return NextResponse.json({
      ok: true,
      data: {
        signedIn: false,
        user: null,
        session: null,
        activeOrg: null,
        roles: [],
        orgSettings: null,
      },
    })
  }
}
