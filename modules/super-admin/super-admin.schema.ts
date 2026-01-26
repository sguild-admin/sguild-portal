import { z } from "zod"

export const superAdminSchemas = {
  createUser: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    // Better Auth Admin plugin user roles, not org roles
    role: z.string().optional(),
  }),

  listUsers: z.object({
    searchValue: z.string().optional(),
    searchField: z.enum(["email", "name"]).optional(),
    searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    sortBy: z.string().optional(),
    sortDirection: z.enum(["asc", "desc"]).optional(),
    filterField: z.string().optional(),
    filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte"]).optional(),
  }),

  createOrg: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    logo: z.string().url().optional(),
    ownerUserId: z.string().min(1), // create org on behalf of this user (server-only)
    addSuperAdminAsAdmin: z.boolean().default(true),
  }),

  listOrgs: z.object({
    q: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),

  addOrgMember: z.object({
    organizationId: z.string().min(1),
    userId: z.string().min(1),
    role: z.union([z.string(), z.array(z.string())]),
    teamId: z.string().optional(),
  }),

  inviteOrgMember: z.object({
    organizationId: z.string().min(1),
    email: z.string().email(),
    role: z.union([z.string(), z.array(z.string())]),
    resend: z.boolean().optional(),
    teamId: z.string().optional(),
  }),
}

export type CreateUserInput = z.infer<typeof superAdminSchemas.createUser>
export type ListUsersInput = z.infer<typeof superAdminSchemas.listUsers>
export type CreateOrgInput = z.infer<typeof superAdminSchemas.createOrg>
export type ListOrgsInput = z.infer<typeof superAdminSchemas.listOrgs>
export type AddOrgMemberInput = z.infer<typeof superAdminSchemas.addOrgMember>
export type InviteOrgMemberInput = z.infer<typeof superAdminSchemas.inviteOrgMember>
