import { z } from "zod"

export const UpdateOrgSettingsSchema = z.object({
  timeZone: z.string().trim().min(1).max(100).optional(),
  currency: z.string().trim().min(1).max(10).optional(),
  offersOceanLessons: z.boolean().optional(),

  acuityEnabled: z.boolean().optional(),
  acuityUserId: z.string().trim().min(1).max(500).nullable().optional(),
  acuityApiKey: z.string().trim().min(1).max(5000).nullable().optional(),
})
export type UpdateOrgSettingsInput = z.infer<typeof UpdateOrgSettingsSchema>
