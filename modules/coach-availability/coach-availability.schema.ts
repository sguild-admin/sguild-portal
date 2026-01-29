import { z } from "zod"

const TimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm format")

export const CoachAvailabilitySlotSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: TimeSchema,
    endTime: TimeSchema,
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: "Start time must be before end time",
    path: ["endTime"],
  })

export const CoachAvailabilityListSchema = z.array(CoachAvailabilitySlotSchema).max(200)
export type CoachAvailabilitySlotInput = z.infer<typeof CoachAvailabilitySlotSchema>
export type CoachAvailabilityListInput = z.infer<typeof CoachAvailabilityListSchema>
