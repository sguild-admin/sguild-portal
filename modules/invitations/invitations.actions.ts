"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { CreateInviteSchema, RevokeInviteSchema } from "./invitations.schema"

const COACH_ORG_ROLE = "member" as const

export async function listInvitationsAction() {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const orgId = await requireActiveOrgId(hdrs)

  return auth.api.listInvitations({
    headers: hdrs,
    query: {
      organizationId: orgId,
    } as any,
  })
}

export async function createInvitationAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const data = CreateInviteSchema.parse(input)
  const orgId = await requireActiveOrgId(hdrs)

  return auth.api.createInvitation({
    headers: hdrs,
    body: {
      organizationId: orgId,
      email: data.email,
      role: COACH_ORG_ROLE,
      expiresInDays: data.expiresInDays,
      resend: data.resend,
    } as any,
  })
}

export async function cancelInvitationAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const data = RevokeInviteSchema.parse(input)
  const orgId = await requireActiveOrgId(hdrs)

  return auth.api.cancelInvitation({
    headers: hdrs,
    body: { organizationId: orgId, invitationId: data.invitationId } as any,
  })
}

export async function acceptInvitationAction(invitationId: string) {
  const hdrs = await headers()
  await requireSession(hdrs)

  return auth.api.acceptInvitation({
    headers: hdrs,
    body: { invitationId },
  })
}

export async function rejectInvitationAction(invitationId: string) {
  const hdrs = await headers()
  await requireSession(hdrs)

  return auth.api.rejectInvitation({
    headers: hdrs,
    body: { invitationId },
  })
}
