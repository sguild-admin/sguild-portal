// modules/webhooks/clerk.webhooks.ts
import "server-only"

import { verifyWebhook } from "@clerk/backend/webhooks"
import type { WebhookEvent } from "@clerk/backend/webhooks"

export type ClerkWebhookEvent = WebhookEvent

export async function verifyClerkWebhook(request: Request): Promise<ClerkWebhookEvent> {
  const signingSecret = process.env.CLERK_WEBHOOK_SECRET?.trim()
  if (!signingSecret) throw new Error("Missing CLERK_WEBHOOK_SECRET")

  return verifyWebhook(request, { signingSecret })
}

export function isOrganizationEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("organization.")
}

export function isOrganizationMembershipEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("organizationMembership.")
}

export function isOrganizationInvitationEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("organizationInvitation.")
}

export function extractOrganization(
  evt: ClerkWebhookEvent
): { clerkOrgId: string; name?: string } | null {
  if (!isOrganizationEvent(evt)) return null
  const data: any = (evt as any).data
  const clerkOrgId = data?.id
  if (!clerkOrgId) return null
  return { clerkOrgId, name: data?.name }
}

export function extractMembership(
  evt: ClerkWebhookEvent
): {
  clerkMembershipId?: string
  clerkOrgId: string
  clerkUserId: string
  clerkRole?: string
  statusHint?: "INVITED" | "ACTIVE" | "DISABLED"
  email?: string | null
  metadata?: Record<string, unknown> | null
} | null {
  if (!isOrganizationMembershipEvent(evt)) return null
  const data: any = (evt as any).data

  const clerkOrgId = data?.organization?.id ?? data?.organization_id
  const clerkUserId =
    data?.public_user_data?.user_id ??
    data?.public_user_data?.userId ??
    data?.user_id ??
    data?.userId

  if (!clerkOrgId || !clerkUserId) return null

  const clerkRole = typeof data?.role === "string" ? data.role : undefined
  const statusHint = inferMembershipStatusHint(evt.type, data?.status)
  const email = typeof data?.public_user_data?.identifier === "string" ? data.public_user_data.identifier : null
  const metadata = (data?.public_metadata as Record<string, unknown> | null) ?? null

  return {
    clerkMembershipId: data?.id,
    clerkOrgId,
    clerkUserId,
    clerkRole,
    statusHint,
    email,
    metadata,
  }
}

export function extractInvitation(
  evt: ClerkWebhookEvent
): {
  clerkInvitationId: string
  clerkOrgId: string
  email: string
  role?: string
  status?: string | null
  expiresAt?: Date | null
  publicMetadata?: Record<string, unknown> | null
} | null {
  if (!isOrganizationInvitationEvent(evt)) return null
  const data: any = (evt as any).data

  const clerkInvitationId = data?.id
  const clerkOrgId = data?.organization_id ?? data?.organization?.id
  const email = data?.email_address

  if (!clerkInvitationId || !clerkOrgId || !email) return null

  const role = typeof data?.role === "string" ? data.role : undefined
  const status = typeof data?.status === "string" ? data.status : null
  const expiresAt = typeof data?.expires_at === "number" ? new Date(data.expires_at) : null
  const publicMetadata = (data?.public_metadata as Record<string, unknown> | null) ?? null

  return {
    clerkInvitationId,
    clerkOrgId,
    email,
    role,
    status,
    expiresAt,
    publicMetadata,
  }
}

function inferMembershipStatusHint(
  eventType: string,
  rawStatus: unknown
): "INVITED" | "ACTIVE" | "DISABLED" | undefined {
  if (eventType.endsWith(".deleted")) return "DISABLED"

  if (typeof rawStatus === "string") {
    const s = rawStatus.toLowerCase()
    if (s.includes("active")) return "ACTIVE"
    if (s.includes("invited") || s.includes("pending")) return "INVITED"
    if (s.includes("disabled") || s.includes("deleted")) return "DISABLED"
  }

  return undefined
}
