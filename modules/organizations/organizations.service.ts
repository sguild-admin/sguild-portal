// modules/organizations/organizations.service.ts
import { auth } from "@/lib/auth/auth"
import { getActiveRoles, requireSession } from "@/lib/auth/guards"
import { orgSettingsRepo } from "@/modules/org-settings/org-settings.repo"

type CreateOrgInput = {
  name: string
  slug?: string
  logo?: string | null
  metadata?: string | null
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function parseMetadata(raw: string | null | undefined): Record<string, any> | undefined {
  if (!raw) return undefined
  const s = raw.trim()
  if (!s) return undefined
  try {
    return JSON.parse(s) as Record<string, any>
  } catch {
    return { raw: s }
  }
}

export const organizationsService = {
  async list(headers: Headers) {
    await requireSession(headers)
    return auth.api.listOrganizations({ headers })
  },

  async create(headers: Headers, input: CreateOrgInput) {
    await requireSession(headers)

    const slug = input.slug?.trim() ? input.slug.trim() : slugify(input.name)

    const created = await auth.api.createOrganization({
      headers,
      body: {
        name: input.name,
        slug,
        logo: input.logo ?? undefined,
        metadata: parseMetadata(input.metadata),
        keepCurrentActiveOrganization: false,
      },
    })

    const orgId = (created as any)?.id as string | undefined
    if (orgId) await orgSettingsRepo.ensureDefaults(orgId)

    return created
  },

  async setActive(headers: Headers, input: { organizationId?: string | null; organizationSlug?: string }) {
    await requireSession(headers)
    return auth.api.setActiveOrganization({
      headers,
      body: {
        organizationId: input.organizationId ?? null,
        organizationSlug: input.organizationSlug ?? undefined,
      },
    })
  },

  async getActiveMemberRoles(headers: Headers) {
    await requireSession(headers)
    return getActiveRoles(headers)
  },
}
