import { auth } from "@/lib/auth/auth"
import { requireSession, requireSuperAdmin } from "@/lib/auth/guards"
import { AppError } from "@/lib/http/errors"
import { slugifyOrgName } from "@/lib/utils/slug"
import { orgSettingsRepo } from "@/modules/org-settings/org-settings.repo"
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
  UpdateOrgInput,
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

  async getOrg(headers: Headers, input: { orgId: string }) {
    await requireSuperAdmin(headers)
    if (!input.orgId) throw new AppError("BAD_REQUEST", "Missing orgId")
    const org = await superAdminRepo.getOrganizationById(input.orgId)
    if (!org) throw new AppError("NOT_FOUND", "Organization not found")
    return toSuperAdminOrgDto(org)
  },

  async updateOrg(headers: Headers, input: { orgId: string; data: UpdateOrgInput }) {
    await requireSuperAdmin(headers)

    const existing = await superAdminRepo.getOrganizationById(input.orgId)
    if (!existing) throw new AppError("NOT_FOUND", "Organization not found")

    if (input.data.slug && input.data.slug !== existing.slug) {
      const bySlug = await superAdminRepo.getOrganizationBySlug(input.data.slug)
      if (bySlug && bySlug.id !== input.orgId) {
        throw new AppError("BAD_REQUEST", "Slug already in use")
      }
    }

    const updated = await superAdminRepo.updateOrganization(input.orgId, {
      name: input.data.name,
      slug: input.data.slug,
    })

    const settingsUpdate: { timeZone?: string; offersOceanLessons?: boolean } = {}
    if (typeof input.data.timeZone === "string") {
      settingsUpdate.timeZone = input.data.timeZone
    }
    if (typeof input.data.offersOceanLessons === "boolean") {
      settingsUpdate.offersOceanLessons = input.data.offersOceanLessons
    }

    if (Object.keys(settingsUpdate).length > 0) {
      await orgSettingsRepo.ensureDefaults(input.orgId)
      await orgSettingsRepo.updateByOrgId(input.orgId, settingsUpdate)
    }

    const refreshed = await superAdminRepo.getOrganizationById(input.orgId)
    return toSuperAdminOrgDto(refreshed ?? updated)
  },

  async deleteOrg(headers: Headers, input: { orgId: string }) {
    await requireSuperAdmin(headers)

    const existing = await superAdminRepo.getOrganizationById(input.orgId)
    if (!existing) throw new AppError("NOT_FOUND", "Organization not found")

    await superAdminRepo.deleteOrganization(input.orgId)
    return { id: input.orgId }
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

    const orgWithCounts = await superAdminRepo.getOrganizationById(org.id)
    return toSuperAdminOrgDto(orgWithCounts ?? org)
  },

  async addOrgMember(headers: Headers, input: AddOrgMemberInput) {
    await requireSuperAdmin(headers)

    const roleList = Array.isArray(input.role) ? input.role : [input.role]
    if (roleList.some((role) => role === "owner")) {
      throw new AppError("BAD_REQUEST", "Cannot promote to owner")
    }

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

    const roleList = Array.isArray(input.role) ? input.role : [input.role]
    if (roleList.some((role) => role === "owner")) {
      throw new AppError("BAD_REQUEST", "Cannot promote to owner")
    }

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
