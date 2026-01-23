// modules/webhooks/webhooks.actions.ts
import "server-only"

import type { AppCtx } from "@/modules/_shared/ctx"
import { HttpError } from "@/modules/_shared/errors"
import { idempotencyService } from "@/modules/_shared/idempotency"
import { membersService } from "@/modules/members/members.service"
import { orgService } from "@/modules/org/org.service"
import { usersService } from "@/modules/users/users.service"
import { extractMembership, extractOrganization } from "@/modules/webhooks/clerk.webhooks"

type ClerkEvent = {
  id: string
  type: string
  data: unknown
}

function isDeletedEvent(type: string) {
  return type.endsWith(".deleted")
}

export async function handleClerkEventAction(args: {
  ctx: AppCtx
  event: ClerkEvent
  eventCreatedAt: Date
}) {
  const { ctx, event, eventCreatedAt } = args

  if (!event?.id || typeof event.id !== "string") {
    throw new HttpError(400, "INVALID_WEBHOOK_EVENT", "Missing event id")
  }

  const { processed } = await idempotencyService.runOnce(ctx, {
    provider: "clerk",
    eventId: event.id,
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
      }
    },
  })

  return { processed }
}
