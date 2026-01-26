import { z } from "zod"

export const InviteRoleSchema = z.enum(["owner", "admin", "coach", "member"])
export type InviteRole = z.infer<typeof InviteRoleSchema>

export const CreateInviteSchema = z.object({
  email: z.string().trim().email(),
  role: InviteRoleSchema,
  expiresInDays: z.number().int().min(1).max(365).optional(),
})
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>

export const RevokeInviteSchema = z.object({
  invitationId: z.string().min(1),
})
export type RevokeInviteInput = z.infer<typeof RevokeInviteSchema>
