import { z } from "zod"

export const CreateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  logo: z.string().trim().min(1).max(5000).nullable().optional(),
  metadata: z.string().trim().min(1).max(20000).nullable().optional(),
  keepCurrentActiveOrganization: z.boolean().optional(),
})
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>

export const SetActiveOrganizationSchema = z.object({
  organizationId: z.string().min(1).nullable().optional(),
  organizationSlug: z.string().min(1).optional(),
})
export type SetActiveOrganizationInput = z.infer<typeof SetActiveOrganizationSchema>
