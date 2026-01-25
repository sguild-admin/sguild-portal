// modules/orgInvites/orgInvites.actions.ts
// Server actions for org invitation flows.
import "server-only"

import { clerkClient } from "@clerk/nextjs/server"
import { OrgInviteStatus } from "@prisma/client"
import { randomUUID } from "node:crypto"
import { authzService, HttpError } from "@/modules/authz/authz.service"
import { asInt, getQuery } from "@/modules/_shared/http"
import { orgInvitesService } from "@/modules/orgInvites/orgInvites.service"
import {
  CreateOrgInviteBodySchema,
  ListOrgInvitesQuerySchema,
  PatchOrgInviteBodySchema,
} from "@/modules/orgInvites/orgInvites.schema"
import { toOrgInviteDTO } from "@/modules/orgInvites/orgInvites.dto"
import env from "@/lib/env"

function getClerkErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const anyErr = err as any
    const first = anyErr?.errors?.[0]
    const code = typeof first?.code === "string" ? first.code.trim() : ""
    const longMessage =
      typeof first?.long_message === "string" ? first.long_message.trim() : ""
    const message =
      typeof first?.message === "string" ? first.message.trim() : ""
    const meta = first?.meta ? JSON.stringify(first.meta) : ""
    const baseMessage = longMessage || message || (typeof anyErr?.message === "string" ? anyErr.message : "")
    if (code && baseMessage) return `${code}: ${baseMessage}${meta ? ` (${meta})` : ""}`
    if (baseMessage) return `${baseMessage}${meta ? ` (${meta})` : ""}`
    if (code) return code
  }
  return "Clerk invitation failed"
}

async function resolveInviteRole(
  client: Awaited<ReturnType<typeof clerkClient>>,
  clerkOrgId: string,
  clerkUserId: string
): Promise<string> {
  if (env.CLERK_COACH_ROLE) return env.CLERK_COACH_ROLE

  let adminRole: string | null = null
  try {
    const memberships = await client.users.getOrganizationMembershipList({
      userId: clerkUserId,
      limit: 100,
    })
    const match = memberships.data.find(m => m.organization?.id === clerkOrgId)
    adminRole = typeof match?.role === "string" ? match.role : null
  } catch {
    adminRole = null
  }

  try {
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: clerkOrgId,
      limit: 100,
    })
    const roles = memberships.data
      .map(m => (typeof m?.role === "string" ? m.role : null))
      .filter(Boolean) as string[]
    const nonAdmin = roles.find(role => !adminRole || role !== adminRole)
    if (nonAdmin) return nonAdmin
    if (adminRole) return adminRole
    if (roles.length) return roles[0]
  } catch {
    // ignore and fall back
  }

  return "org:member"
}


// List invites for the active org (admin only).
export async function listOrgInvitesAction(request: Request) {
  const { org } = await authzService.requireAdmin()

  const params = getQuery(request)
  const take = Math.min(asInt(params.get("take"), 100), 200)
  const skip = Math.max(asInt(params.get("skip"), 0), 0)
  const status = params.get("status") ?? undefined

  const input = ListOrgInvitesQuerySchema.parse({ status, take, skip })
  const invites = await orgInvitesService.listByOrg(org.id, input)

  return { invites: invites.map(toOrgInviteDTO) }
}

// Create or update an org invite via Clerk.
export async function createOrgInviteAction(body: unknown) {
  const { org, clerkOrgId, clerkUserId } = await authzService.requireAdmin()
  const data = CreateOrgInviteBodySchema.parse(body)

  const email = data.email.trim().toLowerCase()
  // Invites are always for coaches; UI never exposes role changes.
  const existing = await orgInvitesService.getByOrgAndEmail(org.id, email)
  if (existing?.status === OrgInviteStatus.ACCEPTED) {
    throw new HttpError(409, "ALREADY_MEMBER", "Member already accepted invite")
  }

  const dbInviteId = existing?.status === OrgInviteStatus.PENDING ? existing.id : randomUUID()

  const client = await clerkClient()
  let clerkOrg
  try {
    clerkOrg = await client.organizations.getOrganization({ organizationId: clerkOrgId })
  } catch (err) {
    throw new HttpError(404, "CLERK_ORG_LOOKUP_FAILED", getClerkErrorMessage(err))
  }
  const basePayload = {
    organizationId: clerkOrg.id,
    emailAddress: email,
    role: await resolveInviteRole(client, clerkOrgId, clerkUserId),
    expiresInDays: data.expiresInDays,
    redirectUrl: data.redirectUrl,
    publicMetadata: {
      dbInviteId,
    },
  }

  let invite
  try {
    invite = await client.organizations.createOrganizationInvitation({
      ...basePayload,
      inviterUserId: clerkUserId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : ""
    try {
      invite = await client.organizations.createOrganizationInvitation(basePayload)
    } catch (retryErr) {
      throw new HttpError(400, "CLERK_INVITE_FAILED", getClerkErrorMessage(retryErr))
    }
  }

  const expiresAt = invite.expiresAt ? new Date(invite.expiresAt) : null
  const lastSentAt = new Date()

  if (existing && existing.status === OrgInviteStatus.PENDING) {
    const updated = await orgInvitesService.updateById(existing.id, {
      clerkInvitationId: invite.id,
      email,
      role: invite.role ?? existing.role,
      status: OrgInviteStatus.PENDING,
      lastSentAt,
      expiresAt,
      acceptedAt: null,
      revokedAt: null,
    })

    return { invite: toOrgInviteDTO(updated) }
  }

  const created = await orgInvitesService.createFromClerkInvitation({
    id: dbInviteId,
    orgId: org.id,
    clerkInvitationId: invite.id,
    email,
    role: invite.role ?? null,
    rawStatus: invite.status ?? "pending",
    expiresAt,
    lastSentAt,
  })

  return { invite: toOrgInviteDTO(created) }
}

// Fetch a single invite by id (admin only).
export async function getOrgInviteByIdAction(inviteId: string) {
  const { org } = await authzService.requireAdmin()

  const invite = await orgInvitesService.getById(inviteId)
  if (!invite || invite.orgId !== org.id) {
    throw new HttpError(404, "NOT_FOUND", "Invitation not found")
  }

  return { invite: toOrgInviteDTO(invite) }
}

// Revoke an invite via Clerk and update local record.
export async function revokeOrgInviteAction(clerkInvitationId: string, body: unknown) {
  const { org, clerkOrgId, clerkUserId } = await authzService.requireAdmin()
  PatchOrgInviteBodySchema.parse(body)

  const invite = await orgInvitesService.getByClerkInvitationId(clerkInvitationId)
  if (!invite || invite.orgId !== org.id) {
    throw new HttpError(404, "NOT_FOUND", "Invitation not found")
  }

  const client = await clerkClient()
  await client.organizations.revokeOrganizationInvitation({
    organizationId: clerkOrgId,
    invitationId: invite.clerkInvitationId,
    requestingUserId: clerkUserId,
  })

  const updated = await orgInvitesService.markRevokedByClerkInvitationId(
    invite.clerkInvitationId,
    new Date()
  )

  return { invite: toOrgInviteDTO(updated) }
}

// Resend an invite via Clerk and update local record.
export async function resendOrgInviteAction(clerkInvitationId: string) {
  const { org, clerkOrgId, clerkUserId } = await authzService.requireAdmin()

  const existing = await orgInvitesService.getByClerkInvitationId(clerkInvitationId)
  if (!existing || existing.orgId !== org.id) {
    throw new HttpError(404, "NOT_FOUND", "Invitation not found")
  }

  if (existing.status === OrgInviteStatus.ACCEPTED) {
    throw new HttpError(409, "ALREADY_MEMBER", "Member already accepted invite")
  }

  const client = await clerkClient()
  let clerkOrg
  try {
    clerkOrg = await client.organizations.getOrganization({ organizationId: clerkOrgId })
  } catch (err) {
    throw new HttpError(404, "CLERK_ORG_LOOKUP_FAILED", getClerkErrorMessage(err))
  }
  const basePayload = {
    organizationId: clerkOrg.id,
    emailAddress: existing.email,
    role: await resolveInviteRole(client, clerkOrgId, clerkUserId),
    publicMetadata: {
      dbInviteId: existing.id,
    },
  }

  let invite
  try {
    invite = await client.organizations.createOrganizationInvitation({
      ...basePayload,
      inviterUserId: clerkUserId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : ""
    try {
      invite = await client.organizations.createOrganizationInvitation(basePayload)
    } catch (retryErr) {
      throw new HttpError(400, "CLERK_INVITE_FAILED", getClerkErrorMessage(retryErr))
    }
  }

  const updated = await orgInvitesService.updateById(existing.id, {
    clerkInvitationId: invite.id,
    role: invite.role ?? existing.role,
    status: OrgInviteStatus.PENDING,
    lastSentAt: new Date(),
    expiresAt: invite.expiresAt ? new Date(invite.expiresAt) : null,
    acceptedAt: null,
    revokedAt: null,
  })

  return { invite: toOrgInviteDTO(updated) }
}
