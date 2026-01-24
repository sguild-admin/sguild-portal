// modules/webhooks/clerk.webhooks.ts
// Clerk webhook verification and payload extraction helpers.
import "server-only"

import { verifyWebhook } from "@clerk/backend/webhooks"
import type { WebhookEvent } from "@clerk/backend/webhooks"

// Export the Clerk webhook event type for reuse.
export type ClerkWebhookEvent = WebhookEvent

// Verify Svix signature and return the parsed event.
export async function verifyClerkWebhook(request: Request): Promise<ClerkWebhookEvent> {
  const signingSecret = process.env.CLERK_WEBHOOK_SECRET?.trim()
  if (!signingSecret) throw new Error("Missing CLERK_WEBHOOK_SECRET")

  return verifyWebhook(request, { signingSecret })
}

// Type guards for event categories.
export function isOrganizationEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("organization.")
}

export function isUserEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("user.")
}

export function isOrganizationMembershipEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("organizationMembership.")
}

export function isOrganizationInvitationEvent(evt: ClerkWebhookEvent): boolean {
  return typeof evt?.type === "string" && evt.type.startsWith("organizationInvitation.")
}

// Extract org fields from organization.* events.
export function extractOrganization(
  evt: ClerkWebhookEvent
): { clerkOrgId: string; name?: string } | null {
  if (!isOrganizationEvent(evt)) return null
  const data: any = (evt as any).data
  const clerkOrgId = data?.id
  if (!clerkOrgId) return null
  return { clerkOrgId, name: data?.name }
}

// Extract user fields from user.* events.
export function extractUser(
  evt: ClerkWebhookEvent
): {
  clerkUserId: string
  primaryEmail?: string | null
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  phone?: string | null
  lastSignInAt?: Date | null
  lastSeenAt?: Date | null
  isDisabled?: boolean
} | null {
  if (!isUserEvent(evt)) return null
  const data: any = (evt as any).data
  const clerkUserId = data?.id
  if (!clerkUserId) return null

  const primaryEmailId = data?.primary_email_address_id
  const primaryEmail =
    Array.isArray(data?.email_addresses) && primaryEmailId
      ? data.email_addresses.find((e: any) => e?.id === primaryEmailId)?.email_address ?? null
      : null

  const primaryPhoneId = data?.primary_phone_number_id
  const phone =
    Array.isArray(data?.phone_numbers) && primaryPhoneId
      ? data.phone_numbers.find((p: any) => p?.id === primaryPhoneId)?.phone_number ?? null
      : null

  const firstName = typeof data?.first_name === "string" ? data.first_name : null
  const lastName = typeof data?.last_name === "string" ? data.last_name : null
  const username = typeof data?.username === "string" ? data.username : null

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()
  const displayName = fullName || username || null

  const lastSignInAt =
    typeof data?.last_sign_in_at === "number" ? new Date(data.last_sign_in_at) : null
  const lastSeenAt = typeof data?.last_active_at === "number" ? new Date(data.last_active_at) : null

  const isDisabled = !!(data?.banned || data?.locked)

  return {
    clerkUserId,
    primaryEmail,
    firstName,
    lastName,
    displayName,
    phone,
    lastSignInAt,
    lastSeenAt,
    isDisabled,
  }
}

// Extract membership fields from organizationMembership.* events.
export function extractMembership(
  evt: ClerkWebhookEvent
): {
  clerkMembershipId?: string
  clerkOrgId: string
  clerkUserId: string
  clerkRole?: string
  statusHint?: "ACTIVE" | "DISABLED"
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

  const clerkRole =
    typeof data?.role === "string"
      ? data.role
      : typeof data?.role_name === "string"
        ? data.role_name
        : undefined
  const statusHint = inferMembershipStatusHint(evt.type, data?.status)
  const email =
    typeof data?.public_user_data?.identifier === "string"
      ? data.public_user_data.identifier
      : null
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

// Extract invitation fields from organizationInvitation.* events.
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

// Infer ACTIVE/DISABLED status from event type and raw status.
function inferMembershipStatusHint(
  eventType: string,
  rawStatus: unknown
): "ACTIVE" | "DISABLED" | undefined {
  if (eventType === "organizationMembership.created") return "ACTIVE"

  if (eventType.endsWith(".deleted")) return "DISABLED"

  if (typeof rawStatus === "string") {
    const s = rawStatus.toLowerCase()
    if (s.includes("active")) return "ACTIVE"
    if (s.includes("disabled") || s.includes("deleted")) return "DISABLED"
  }

  return "ACTIVE"
}
