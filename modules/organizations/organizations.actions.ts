"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { getActiveRoles, requireSession } from "@/lib/auth/guards"
import { CreateOrganizationSchema } from "./organizations.schema"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function parseMetadata(raw: unknown): Record<string, any> | undefined {
  if (!raw) return undefined
  if (typeof raw === "object") return raw as Record<string, any>
  if (typeof raw === "string") {
    const s = raw.trim()
    if (!s) return undefined
    try {
      return JSON.parse(s) as Record<string, any>
    } catch {
      return { raw: s }
    }
  }
  return undefined
}

export async function listOrganizationsAction() {
  const hdrs = await headers()
  await requireSession(hdrs)
  return auth.api.listOrganizations({ headers: hdrs })
}

export async function createOrganizationAction(input: unknown) {
  const hdrs = await headers()
  await requireSession(hdrs)
  const data = CreateOrganizationSchema.parse(input)

  const slug = data.slug?.trim() ? data.slug.trim() : slugify(data.name)

  return auth.api.createOrganization({
    headers: hdrs,
    body: {
      name: data.name,
      slug,
      logo: data.logo ?? undefined,
      metadata: parseMetadata(data.metadata),
      keepCurrentActiveOrganization: false,
    },
  })
}

export async function setActiveOrganizationAction(input: {
  organizationId?: string | null
  organizationSlug?: string
}) {
  const hdrs = await headers()
  await requireSession(hdrs)
  return auth.api.setActiveOrganization({
    headers: hdrs,
    body: {
      organizationId: input.organizationId ?? null,
      organizationSlug: input.organizationSlug ?? undefined,
    },
  })
}

export async function getActiveMemberRolesAction() {
  const hdrs = await headers()
  await requireSession(hdrs)
  return getActiveRoles(hdrs)
}
