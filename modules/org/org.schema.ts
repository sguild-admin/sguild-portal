// modules/org/org.schema.ts
// Zod schemas for org actions.
import { z } from "zod"

// Body schema for updating primary admin.
export const SetPrimaryAdminBodySchema = z.object({
  clerkUserId: z.string().min(1).nullable(),
})
