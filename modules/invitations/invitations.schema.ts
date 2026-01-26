import { z } from "zod"

export const CreateInviteSchema = z.object({
  email: z.string().trim().email(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  resend: z.boolean().optional(),
})
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>

export const RevokeInviteSchema = z.object({
  invitationId: z.string().min(1),
})
export type RevokeInviteInput = z.infer<typeof RevokeInviteSchema>

export const ListInvitesSchema = z.object({
  limit: z.number().int().min(1).max(500).optional(),
  offset: z.number().int().min(0).optional(),
})
export type ListInvitesInput = z.infer<typeof ListInvitesSchema>
