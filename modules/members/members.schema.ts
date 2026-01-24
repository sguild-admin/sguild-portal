// modules/members/members.schema.ts
// Zod schemas for members endpoints.
import { z } from "zod"
import { OrgRole, MembershipStatus } from "@prisma/client"

// Query params for listing members.
export const ListMembersQuerySchema = z.object({
  role: z.nativeEnum(OrgRole).optional(),
  status: z.nativeEnum(MembershipStatus).optional(),
  take: z.number().int().min(1).max(200).default(100),
  skip: z.number().int().min(0).default(0),
})

// Body for patching a member.
export const PatchMemberBodySchema = z
  .object({
    role: z.nativeEnum(OrgRole).optional(),
    status: z.nativeEnum(MembershipStatus).optional(),
  })
  .refine(v => v.role || v.status, { message: "Provide role and or status" })
