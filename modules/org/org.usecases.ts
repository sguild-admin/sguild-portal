/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOrganizationByClerkOrgId, createOrganization, listOrganizations, updateOrganizationByClerkOrgId } from "./org.repo"
import { BadRequestError, NotFoundError } from "@/lib/errors"

export async function ensureOrganization(clerkOrgId: string, name?: string) {
  const org = await getOrganizationByClerkOrgId(clerkOrgId)
  if (org) return org
  if (!name) throw new BadRequestError("Organization not found; name required to create")
  return createOrganization(clerkOrgId, name)
}

export async function getOrgOrThrow(clerkOrgId: string) {
  const org = await getOrganizationByClerkOrgId(clerkOrgId)
  if (!org) throw new NotFoundError("Organization not found")
  return org
}

export async function adminListOrganizations() {
  return listOrganizations()
}

export async function syncFromClerkEvent(event: unknown) {
  try {
    let type = ""
    let data: any = {}
    if (typeof event === "object" && event !== null) {
      const e = event as Record<string, unknown>
      if (typeof e.type === "string") type = e.type
      else if (typeof e.event === "string") type = e.event
      data = (e.data ?? {}) as any
    }

    const clerkOrgId = data?.id ?? data?.organization?.id ?? data?.clerkOrgId
    const name = data?.name ?? data?.organization?.name
    const primaryAdminClerkUserId = data?.primaryAdminClerkUserId ?? data?.organization?.primaryAdminClerkUserId

    if (!clerkOrgId) return { ok: false, reason: "no-clerk-org-id" }

    if (type.includes("created") || type.includes("organization.created") || type.includes("organization.create")) {
      // create if missing
      const existing = await getOrganizationByClerkOrgId(clerkOrgId)
      if (!existing) return createOrganization(clerkOrgId, name ?? clerkOrgId)
      return existing
    }

    if (type.includes("updated") || type.includes("organization.updated") || type.includes("organization.update")) {
      return updateOrganizationByClerkOrgId(clerkOrgId, { name, primaryAdminClerkUserId })
    }

    if (type.includes("deleted") || type.includes("organization.deleted")) {
      // deletion behavior: leave for now — soft-delete or ignore
      return { ok: true, deleted: false }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
