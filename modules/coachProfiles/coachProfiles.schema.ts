// modules/coachProfiles/coachProfiles.schema.ts
// Zod schemas for coach profile actions.
import { z } from "zod"

// Body schema for updating a coach profile.
export const PatchCoachProfileBodySchema = z
  .object({
    bio: z.string().max(4000).optional(),
    notes: z.string().max(8000).optional(),
    zip: z.string().max(20).optional(),
  })
  .refine(v => v.bio !== undefined || v.notes !== undefined || v.zip !== undefined, {
    message: "Provide bio, notes, or zip",
  })
