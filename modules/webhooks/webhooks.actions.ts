// modules/webhooks/webhooks.actions.ts
import "server-only"

import type { AppCtx } from "@/modules/_shared/ctx"
import { HttpError } from "@/modules/_shared/errors"
import { idempotencyService } from "@/modules/_shared/idempotency"
import { coachProfilesService } from "@/modules/coachProfiles/coachProfiles.service"
import { membersService } from "@/modules/members/members.service"
import { orgService } from "@/modules/org/org.service"
import { orgInvitesService } from "@/modules/orgInvites/orgInvites.service"
import { usersService } from "@/modules/users/users.service"
import { extractInvitation, extractMembership, extractOrganization, extractUser } from "@/modules/webhooks/clerk.webhooks"
import { MembershipStatus, OrgRole } from "@prisma/client"

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
      if (event.type === "user.deleted") {
        const clerkUserId = (event as any)?.data?.id
        if (typeof clerkUserId === "string") {
          await usersService.deleteByClerkUserId(clerkUserId)
        }
        return
      }

      if (event.type === "organization.deleted") {
        const clerkOrgId = (event as any)?.data?.id
        if (typeof clerkOrgId === "string") {
          await orgService.deleteByClerkOrgId(clerkOrgId)
        }
        return
      }

      if (event.type === "user.created") {
        const data: any = (event as any)?.data
        const memberships = Array.isArray(data?.organization_memberships)
          ? data.organization_memberships
          : []

        if (memberships.length === 0) {
          const clerkUserId = data?.id
          if (typeof clerkUserId === "string") {
            const client = await ctx.clerk()
            const invites = await client.users.getOrganizationInvitationList({
              userId: clerkUserId,
              status: "pending",
              limit: 1,
            })

            if (invites?.data?.length) {
              return
            }

            await client.users.deleteUser(clerkUserId)
          }
          return
        }
      }

      const user = extractUser(event as any)
      if (user && (event.type === "user.created" || event.type === "user.updated")) {
        await usersService.upsertFromClerkUser(user)
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

        try {
          const client = await ctx.clerk()
          const clerkUser = await client.users.getUser(mem.clerkUserId)
          await usersService.upsertFromClerkUserResource(clerkUser as any)
        } catch {
          await usersService.getOrCreateByClerkUserId(mem.clerkUserId)
        }

        const membership = await membersService.syncFromClerkMembership({
          action: isDeletedEvent(event.type) ? "delete" : "upsert",
          orgId: dbOrg.id,
          clerkUserId: mem.clerkUserId,
          clerkRole: mem.clerkRole ?? null,
          clerkStatus: mem.statusHint ?? null,
          eventCreatedAt,
        })

        if (
          !isDeletedEvent(event.type) &&
          membership &&
          membership.role === OrgRole.COACH &&
          membership.status === MembershipStatus.ACTIVE
        ) {
          const appUser = await usersService.getOrCreateByClerkUserId(mem.clerkUserId)
          await coachProfilesService.upsertByAppUserId(appUser.id, {})
        }

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
