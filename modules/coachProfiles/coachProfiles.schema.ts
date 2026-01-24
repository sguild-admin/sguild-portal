import { z } from "zod"

export const PatchCoachProfileBodySchema = z
  .object({
    bio: z.string().max(4000).optional(),
    notes: z.string().max(8000).optional(),
    zip: z.string().max(20).optional(),
  })
  .refine(v => v.bio !== undefined || v.notes !== undefined || v.zip !== undefined, {
    message: "Provide bio, notes, or zip",
  })
