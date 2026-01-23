// modules/org/org.schema.ts
import { z } from "zod"

export const SetPrimaryAdminBodySchema = z.object({
  clerkUserId: z.string().min(1).nullable(),
})
