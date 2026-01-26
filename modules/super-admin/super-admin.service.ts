import { auth } from "@/lib/auth/auth"
import { requireSession, requireSuperAdmin } from "@/lib/auth/guards"
import { AppError } from "@/lib/http/errors"
import { slugifyOrgName } from "@/lib/utils/slug"
import { superAdminRepo } from "./super-admin.repo"
import {
  toSuperAdminOrgDto,
  toSuperAdminUserDto,
} from "./super-admin.dto"
import type {
  AddOrgMemberInput,
  CreateOrgInput,
  CreateUserInput,
  InviteOrgMemberInput,
  ListOrgsInput,
  ListUsersInput,
} from "./super-admin.schema"

export const superAdminService = {
  async listUsers(headers: Headers, input: ListUsersInput) {
    await requireSuperAdmin(headers)

    const res = await auth.api.listUsers({
      headers,
      query: {
        ...input,
        limit: input.limit ?? 100,
        offset: input.offset ?? 0,
      } as any,
    })

    const users = (res as any)?.data ?? res
    if (!Array.isArray(users)) return res
    return users.map(toSuperAdminUserDto)
  },

  async createUser(headers: Headers, input: CreateUserInput) {
    await requireSuperAdmin(headers)

    const res = await auth.api.createUser({
      headers,
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role,
      } as any,
    })

    const user = (res as any)?.data ?? res
    return toSuperAdminUserDto(user)
  },

  async listOrgs(headers: Headers, input: ListOrgsInput) {
    await requireSuperAdmin(headers)

    const limit = input.limit ?? 200
    const offset = input.offset ?? 0

    const { rows, total } = await superAdminRepo.listOrganizations({
      q: input.q,
      limit,
      offset,
    })

    return {
      total,
      items: rows.map(toSuperAdminOrgDto),
      limit,
      offset,
    }
  },

  async createOrg(headers: Headers, input: CreateOrgInput) {
    await requireSuperAdmin(headers)
    const session = await requireSession(headers)

    const baseSlug = slugifyOrgName(input.name)
    if (!baseSlug) throw new AppError("BAD_REQUEST", "Organization name produced an empty slug")

    let slug = baseSlug
    let i = 2

    while (await superAdminRepo.slugExists(slug)) {
      slug = `${baseSlug}-${i}`
      i += 1
    }

    const org = await superAdminRepo.createOrgWithOwner({
      orgId: crypto.randomUUID(),
      name: input.name,
      slug,
      ownerUserId: session.userId,
    })

    return toSuperAdminOrgDto(org)
  },

  async addOrgMember(headers: Headers, input: AddOrgMemberInput) {
    await requireSuperAdmin(headers)

    // Server-only addMember does not require session headers :contentReference[oaicite:3]{index=3}
    return auth.api.addMember({
      body: {
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
        teamId: input.teamId,
      } as any,
    })
  },

  async inviteOrgMember(headers: Headers, input: InviteOrgMemberInput) {
    await requireSuperAdmin(headers)

    // createInvitation requires session cookies (pass headers) :contentReference[oaicite:4]{index=4}
    return auth.api.createInvitation({
      headers,
      body: {
        organizationId: input.organizationId,
        email: input.email,
        role: input.role,
        resend: input.resend,
        teamId: input.teamId,
      } as any,
    })
  },
  // inside superAdminService
async inviteOrgAdmin(headers: Headers, input: { organizationId: string; email: string; expiresInDays?: number; resend?: boolean }) {
  await requireSuperAdmin(headers)

  return auth.api.createInvitation({
    headers,
    body: {
      organizationId: input.organizationId,
      email: input.email,
      role: "admin",
      expiresInDays: input.expiresInDays,
      resend: input.resend,
    } as any,
  })
}
}
