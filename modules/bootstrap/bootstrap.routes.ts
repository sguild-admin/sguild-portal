// modules/bootstrap/bootstrap.routes.ts (or wherever your handler lives)
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { orgSettingsRepo } from "@/modules/org-settings/org-settings.repo"
import { fail, ok, toHttpStatus } from "@/lib/http/response"

function normalizeRoles(role: unknown): string[] {
  if (Array.isArray(role)) return role.map(String)
  if (typeof role === "string")
    return role
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
  return []
}

async function isSuperAdmin(userId: string) {
  const row = await prisma.superAdmin.findUnique({
    where: { userId },
    select: { id: true },
  })
  return !!row
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return NextResponse.json(
        ok({
          signedIn: false,
          user: null,
          session: null,
          activeOrg: null,
          roles: [],
          superAdmin: false,
          orgSettings: null,
        })
      )
    }

    const activeOrgId = session.session?.activeOrganizationId ?? null
    const superAdmin = await isSuperAdmin(session.user.id)

    // roles: only meaningful when an active org exists
    let roles: string[] = []
    if (activeOrgId) {
      try {
        const roleRes = await auth.api.getActiveMemberRole({ headers: req.headers })
        const roleRaw = (roleRes as any)?.role ?? (roleRes as any)?.data?.role
        roles = normalizeRoles(roleRaw)
      } catch {
        roles = []
      }
    }

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

    let orgSettings: any = null
    if (activeOrgId) {
      try {
        orgSettings = await orgSettingsRepo.ensureDefaults(activeOrgId)
      } catch {
        orgSettings = null
      }
    }

    return NextResponse.json(
      ok({
        signedIn: true,
        user: { id: session.user.id, email: session.user.email, name: session.user.name },
        session: {
          id: session.session?.id ?? null,
          activeOrganizationId: activeOrgId,
          expiresAt: session.session?.expiresAt ?? null,
        },
        activeOrg,
        roles,
        superAdmin,
        orgSettings,
      })
    )
  } catch (err) {
    return NextResponse.json(fail(err), { status: toHttpStatus(err) })
  }
}
