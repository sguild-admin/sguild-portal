// modules/webhooks/webhooks.actions.ts
import "server-only"

import type { AppCtx } from "@/modules/_shared/ctx"
import { HttpError } from "@/modules/_shared/errors"
import { idempotencyService } from "@/modules/_shared/idempotency"
import { membersService } from "@/modules/members/members.service"
import { orgService } from "@/modules/org/org.service"
import { orgInvitesService } from "@/modules/orgInvites/orgInvites.service"
import { usersService } from "@/modules/users/users.service"
import { extractInvitation, extractMembership, extractOrganization } from "@/modules/webhooks/clerk.webhooks"

type ClerkEvent = {
  id?: string
  type: string
  data: unknown
}

function isDeletedEvent(type: string) {
  return type.endsWith(".deleted")
}

export async function handleClerkEventAction(args: {
  ctx: AppCtx
  eventId: string
  event: ClerkEvent
  eventCreatedAt: Date
}) {
  const { ctx, eventId, event, eventCreatedAt } = args

  if (!eventId || typeof eventId !== "string") {
    throw new HttpError(400, "INVALID_WEBHOOK_EVENT", "Missing event id")
  }

  const { processed } = await idempotencyService.runOnce(ctx, {
    provider: "clerk",
    eventId,
    work: async () => {
      const clerkUserId = (event as any)?.data?.id
      if ((event.type === "user.created" || event.type === "user.updated") && typeof clerkUserId === "string") {
        await usersService.getOrCreateByClerkUserId(clerkUserId)
        return
      }

      const org = extractOrganization(event as any)
      if (org?.clerkOrgId) {
        await orgService.upsertFromClerk({
          clerkOrgId: org.clerkOrgId,
          name: org.name ?? "Organization",
        })
        return
      }

      const invitation = extractInvitation(event as any)
      if (invitation?.clerkOrgId) {
        const dbOrg = await orgService.getOrCreateByClerkOrgId(invitation.clerkOrgId)

        await orgInvitesService.upsertFromClerkInvitation({
          orgId: dbOrg.id,
          clerkInvitationId: invitation.clerkInvitationId,
          email: invitation.email,
          role: invitation.role ?? null,
          rawStatus: invitation.status ?? null,
          expiresAt: invitation.expiresAt ?? null,
          acceptedAt: invitation.status === "accepted" ? eventCreatedAt : null,
          revokedAt: invitation.status === "revoked" ? eventCreatedAt : null,
        })

        return
      }

      const mem = extractMembership(event as any)
      if (mem?.clerkOrgId && mem.clerkUserId) {
        const dbOrg = await orgService.getOrCreateByClerkOrgId(mem.clerkOrgId)

        await membersService.syncFromClerkMembership({
          action: isDeletedEvent(event.type) ? "delete" : "upsert",
          orgId: dbOrg.id,
          clerkUserId: mem.clerkUserId,
          clerkRole: mem.clerkRole ?? null,
          clerkStatus: mem.statusHint ?? null,
          eventCreatedAt,
        })

        if (!isDeletedEvent(event.type) && (event.type === "organizationMembership.created" || mem.statusHint === "ACTIVE")) {
          await orgInvitesService.markAcceptedFromMembership({
            orgId: dbOrg.id,
            acceptedAt: eventCreatedAt,
            email: mem.email ?? null,
            metadata: mem.metadata ?? null,
          })
        }
      }
    },
  })

  return { processed }
}
