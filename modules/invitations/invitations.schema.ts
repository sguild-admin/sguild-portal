import { z } from "zod"

export const inviteRoleSchema = z.enum(["admin", "owner", "coach"])

export const createOrgInviteSchema = z.object({
  orgId: z.string().min(1),
  email: z.string().email(),
  role: inviteRoleSchema.default("admin"),
  expiresInDays: z.number().int().min(1).max(30).default(7),
})

export type CreateOrgInviteInput = z.infer<typeof createOrgInviteSchema>

export const listOrgInvitesSchema = z.object({
  orgId: z.string().min(1),
})
export type ListOrgInvitesInput = z.infer<typeof listOrgInvitesSchema>

export const resendInviteSchema = z.object({
  inviteId: z.string().min(1),
  expiresInDays: z.number().int().min(1).max(30).default(7),
})
export type ResendInviteInput = z.infer<typeof resendInviteSchema>

export const revokeInviteSchema = z.object({
  inviteId: z.string().min(1),
})
export type RevokeInviteInput = z.infer<typeof revokeInviteSchema>

export const acceptInviteSchema = z.object({
  token: z.string().min(20),
})
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
