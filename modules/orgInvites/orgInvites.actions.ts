import "server-only"

import { clerkClient } from "@clerk/nextjs/server"
import { OrgInviteStatus, OrgRole } from "@prisma/client"
import { randomUUID } from "node:crypto"
import { authzService, HttpError } from "@/modules/authz/authz.service"
import { orgInvitesService } from "@/modules/orgInvites/orgInvites.service"
import {
  CreateOrgInviteBodySchema,
  ListOrgInvitesQuerySchema,
  PatchOrgInviteBodySchema,
} from "@/modules/orgInvites/orgInvites.schema"
import { toOrgInviteDTO } from "@/modules/orgInvites/orgInvites.dto"

function parseIntParam(v: string | null, fallback: number) {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

function mapOrgRoleToClerkRole(role: OrgRole): string {
  return role === OrgRole.ADMIN ? "org:admin" : "org:member"
}

export async function listOrgInvitesAction(request: Request) {
  const { org } = await authzService.requireAdmin()

  const url = new URL(request.url)
  const take = Math.min(parseIntParam(url.searchParams.get("take"), 100), 200)
  const skip = Math.max(parseIntParam(url.searchParams.get("skip"), 0), 0)
  const status = url.searchParams.get("status") ?? undefined

  const query = ListOrgInvitesQuerySchema.parse({ status, take, skip })
  const invites = await orgInvitesService.listByOrg(org.id, query)

  return { invites: invites.map(toOrgInviteDTO) }
}

export async function createOrgInviteAction(body: unknown) {
  const { org, clerkOrgId, clerkUserId } = await authzService.requireAdmin()
  const data = CreateOrgInviteBodySchema.parse(body)

  const email = data.email.trim().toLowerCase()
  const role = data.role ?? OrgRole.COACH
  const existing = await orgInvitesService.getByOrgAndEmail(org.id, email)
  if (existing?.status === OrgInviteStatus.ACCEPTED) {
    throw new HttpError(409, "ALREADY_MEMBER", "Member already accepted invite")
  }

  const dbInviteId = existing?.status === OrgInviteStatus.PENDING ? existing.id : randomUUID()

  const client = await clerkClient()
  const invite = await client.organizations.createOrganizationInvitation({
    organizationId: clerkOrgId,
    emailAddress: email,
    role: mapOrgRoleToClerkRole(role),
    inviterUserId: clerkUserId,
    expiresInDays: data.expiresInDays,
    redirectUrl: data.redirectUrl,
    publicMetadata: {
      dbInviteId,
    },
  })

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

export async function getOrgInviteByIdAction(inviteId: string) {
  const { org } = await authzService.requireAdmin()

  const invite = await orgInvitesService.getById(inviteId)
  if (!invite || invite.orgId !== org.id) {
    throw new HttpError(404, "NOT_FOUND", "Invitation not found")
  }

  return { invite: toOrgInviteDTO(invite) }
}

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
  const invite = await client.organizations.createOrganizationInvitation({
    organizationId: clerkOrgId,
    emailAddress: existing.email,
    role: existing.role ?? mapOrgRoleToClerkRole(OrgRole.COACH),
    inviterUserId: clerkUserId,
    publicMetadata: {
      dbInviteId: existing.id,
    },
  })

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
