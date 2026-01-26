import { z } from "zod"

export const MemberRoleSchema = z.enum(["owner", "admin", "coach", "member"])
export type MemberRole = z.infer<typeof MemberRoleSchema>

export const MemberStatusSchema = z.enum(["active", "disabled"])
export type MemberStatus = z.infer<typeof MemberStatusSchema>

export const ListMembersQuerySchema = z.object({
  role: MemberRoleSchema.optional(),
  status: MemberStatusSchema.optional(),
  limit: z.number().int().min(1).max(500).optional(),
  offset: z.number().int().min(0).optional(),
})
export type ListMembersQuery = z.infer<typeof ListMembersQuerySchema>

export const UpdateMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: MemberRoleSchema,
})
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>

export const RemoveMemberSchema = z.object({
  memberIdOrEmail: z.string().min(1),
})
export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>
