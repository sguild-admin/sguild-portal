// modules/users/users.schema.ts
// Zod schemas for user actions.
import { z } from "zod"

// Body schema for provisioning a user by Clerk id.
export const EnsureUserSchema = z.object({
  clerkUserId: z.string().min(1),
})

