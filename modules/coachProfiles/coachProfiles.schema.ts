// modules/coachProfiles/coachProfiles.schema.ts
// Zod schemas for coach profile actions.
import { z } from "zod"

// Body schema for updating a coach profile.
export const PatchCoachProfileBodySchema = z
  .object({
    displayName: z.string().max(200).nullable().optional(),
    bio: z.string().max(4000).nullable().optional(),
    notes: z.string().max(8000).nullable().optional(),
    zip: z.string().max(20).nullable().optional(),
    phone: z.string().max(30).nullable().optional(),
  })
  .refine(
    v =>
      v.displayName !== undefined ||
      v.bio !== undefined ||
      v.notes !== undefined ||
      v.zip !== undefined ||
      v.phone !== undefined,
    {
      message: "Provide display name, bio, notes, zip, or phone",
    }
  )
