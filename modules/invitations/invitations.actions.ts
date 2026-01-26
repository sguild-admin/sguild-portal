"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import { CreateInviteSchema, RevokeInviteSchema } from "./invitations.schema"

export async function listInvitationsAction() {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  // some builds infer org from active org, others require orgId
  // if yours requires it, pass organizationId: await requireActiveOrgId() as any
  return auth.api.listInvitations({
    headers: hdrs,
    query: {} as any,
  })
}

export async function createInvitationAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const data = CreateInviteSchema.parse(input)

  const orgId = await requireActiveOrgId(hdrs)

  // If your auth.api.createInvitation type does NOT include organizationId,
  // remove it and rely on active org (keep the `as any` off)
  return auth.api.createInvitation({
    headers: hdrs,
    body: {
      organizationId: orgId,
      email: data.email,
      role: data.role,
    } as any,
  })
}

export async function cancelInvitationAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  await requireAdminOrOwner(hdrs)

  const data = RevokeInviteSchema.parse(input)

  return auth.api.cancelInvitation({
    headers: hdrs,
    body: { invitationId: data.invitationId },
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
