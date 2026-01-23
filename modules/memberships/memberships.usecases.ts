/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMembership, updateMembershipStatus, listMembersByOrgId, getMembershipById } from "./memberships.repo"
import { NotFoundError, BadRequestError } from "@/lib/errors"

export async function inviteMember(orgId: string, clerkUserId: string, role: "ADMIN" | "COACH") {
  return createMembership(orgId, clerkUserId, role)
}

export async function activateMember(membershipId: string) {
  const m = await getMembershipById(membershipId)
  if (!m) throw new NotFoundError("Membership not found")
  return updateMembershipStatus(membershipId, "ACTIVE")
}

export async function disableMember(membershipId: string) {
  const m = await getMembershipById(membershipId)
  if (!m) throw new NotFoundError("Membership not found")
  return updateMembershipStatus(membershipId, "DISABLED")
}

export async function listMembers(orgId: string) {
  if (!orgId) throw new BadRequestError("orgId required")
  return listMembersByOrgId(orgId)
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

    // extract clerk ids
    const clerkUserId = data?.userId ?? data?.clerkUserId ?? data?.user?.id

    // if membership created
    if (type.includes("membership") && (type.includes("created") || type.includes("create"))) {
      // best-effort: if we have org internal id mapping, this function should be enhanced to locate org id
      // For now, assume repo callable via orgId passed in data.orgInternalId
      const orgId = data?.orgInternalId
      if (orgId && clerkUserId) {
        await createMembership(orgId, clerkUserId, data?.role ?? "COACH")
      }
      return { ok: true }
    }

    // membership status change
    if (type.includes("membership") && (type.includes("activated") || type.includes("updated") || type.includes("status"))) {
      const membershipId = data?.membershipId ?? data?.id
      if (membershipId && data?.status) {
        await updateMembershipStatus(membershipId, data.status)
      }
      return { ok: true }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
