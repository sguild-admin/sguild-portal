// modules/invitations/invitations.service.ts
import { auth } from "@/lib/auth/auth"
import { requireActiveOrgId, requireAdminOrOwner, requireSession } from "@/lib/auth/guards"

type CreateInviteInput = {
  email: string
  role: "owner" | "admin" | "coach" | "member"
  expiresInDays?: number
}

export const invitationsService = {
  async list(headers: Headers) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)

    return auth.api.listInvitations({
      headers,
      query: {
        organizationId: orgId,
      } as any,
    })
  },

  async create(headers: Headers, input: CreateInviteInput) {
    await requireAdminOrOwner(headers)
    const orgId = await requireActiveOrgId(headers)

    return auth.api.createInvitation({
      headers,
      body: {
        organizationId: orgId,
        email: input.email,
        role: input.role,
      } as any,
    })
  },

  async cancel(headers: Headers, input: { invitationId: string }) {
    await requireAdminOrOwner(headers)
    return auth.api.cancelInvitation({
      headers,
      body: { invitationId: input.invitationId },
    })
  },

  async accept(headers: Headers, input: { invitationId: string }) {
    await requireSession(headers)
    return auth.api.acceptInvitation({
      headers,
      body: { invitationId: input.invitationId },
    })
  },

  async reject(headers: Headers, input: { invitationId: string }) {
    await requireSession(headers)
    return auth.api.rejectInvitation({
      headers,
      body: { invitationId: input.invitationId },
    })
  },
}
