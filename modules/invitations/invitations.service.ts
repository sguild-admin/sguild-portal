// modules/invitations/invitations.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"
import type { CreateInviteInput, ListInvitesInput, RevokeInviteInput } from "./invitations.schema"

const COACH_ORG_ROLE = "member" as const

function unwrapData<T>(res: unknown): T {
  const anyRes = res as any
  return (anyRes?.data ?? anyRes) as T
}

export const invitationsService = {
  async list(headers: Headers, input?: ListInvitesInput) {
    await requireAdminOrOwner(headers)
    const organizationId = await requireActiveOrgId(headers)

    const res = await auth.api.listInvitations({
      headers,
      query: {
        organizationId,
        limit: input?.limit ?? 200,
        offset: input?.offset ?? 0,
      } as any,
    })

    return unwrapData(res)
  },

  async create(headers: Headers, input: CreateInviteInput) {
    await requireAdminOrOwner(headers)
    const organizationId = await requireActiveOrgId(headers)

    const res = await auth.api.createInvitation({
      headers,
      body: {
        organizationId,
        email: input.email,
        role: COACH_ORG_ROLE,
        expiresInDays: input.expiresInDays,
        resend: input.resend,
      } as any,
    })

    return unwrapData(res)
  },

  async revoke(headers: Headers, input: RevokeInviteInput) {
    await requireAdminOrOwner(headers)
    const organizationId = await requireActiveOrgId(headers)

    const res = await auth.api.cancelInvitation({
      headers,
      body: {
        organizationId,
        invitationId: input.invitationId,
      } as any,
    })

    return unwrapData(res)
  },

  async accept(headers: Headers, invitationId: string) {
    await requireSession(headers)

    const res = await auth.api.acceptInvitation({
      headers,
      body: { invitationId },
    })

    return unwrapData(res)
  },

  async reject(headers: Headers, invitationId: string) {
    await requireSession(headers)

    const res = await auth.api.rejectInvitation({
      headers,
      body: { invitationId },
    })

    return unwrapData(res)
  },
}
