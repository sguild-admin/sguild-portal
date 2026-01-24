// modules/orgInvites/orgInvites.schema.ts
// Zod schemas for org invite endpoints.
import { z } from "zod"
import { OrgInviteStatus, OrgRole } from "@prisma/client"

// Query params for listing invites.
export const ListOrgInvitesQuerySchema = z.object({
  status: z.nativeEnum(OrgInviteStatus).optional(),
  take: z.number().int().min(1).max(200).default(100),
  skip: z.number().int().min(0).default(0),
})

// Body schema for creating invites.
export const CreateOrgInviteBodySchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgRole).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  redirectUrl: z.string().url().optional(),
})

// Body schema for revoking invites.
export const PatchOrgInviteBodySchema = z.object({
  status: z.literal(OrgInviteStatus.REVOKED),
})
