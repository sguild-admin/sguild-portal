import { z } from "zod"

export const CoachStatusSchema = z.enum(["ACTIVE", "DISABLED"])
export type CoachStatus = z.infer<typeof CoachStatusSchema>

export const UpsertCoachProfileSchema = z.object({
  bio: z.string().trim().min(1).max(5000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  zip: z.string().trim().max(20).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
})
export type UpsertCoachProfileInput = z.infer<typeof UpsertCoachProfileSchema>

export const SetCoachStatusSchema = z.object({
  userId: z.string().min(1),
  status: CoachStatusSchema,
})
export type SetCoachStatusInput = z.infer<typeof SetCoachStatusSchema>
