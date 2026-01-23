// modules/users/users.schema.ts
import { z } from "zod"

export const EnsureUserSchema = z.object({
  clerkUserId: z.string().min(1),
})

export const SetSuperAdminSchema = z.object({
  isSuperAdmin: z.boolean(),
})
