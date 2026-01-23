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

  return {
    clerkMembershipId: data?.id,
    clerkOrgId,
    clerkUserId,
    clerkRole,
    statusHint,
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
