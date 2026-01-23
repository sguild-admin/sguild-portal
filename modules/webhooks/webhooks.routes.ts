// modules/webhooks/webhooks.routes.ts
import "server-only"

import { verifyClerkWebhook, extractMembership, extractOrganization } from "@/modules/webhooks/clerk.webhooks"
import { orgService } from "@/modules/org/org.service"
import { membersService } from "@/modules/members/members.service"
import { jsonError } from "@/lib/errors"

function getEventCreatedAtFromSvix(request: Request): Date {
  const svixTs = request.headers.get("svix-timestamp")
  if (!svixTs) return new Date()
  const n = Number(svixTs)
  if (!Number.isFinite(n)) return new Date()
  return new Date(n * 1000)
}

export const webhooksRoutes = {
  // POST /api/webhooks/clerk
  async clerk(request: Request) {
    try {
      const evt = await verifyClerkWebhook(request)
      const eventCreatedAt = getEventCreatedAtFromSvix(request)

      const org = extractOrganization(evt)
      if (org?.clerkOrgId) {
        await orgService.upsertFromClerk({
          clerkOrgId: org.clerkOrgId,
          name: org.name ?? "Organization",
        })
        return Response.json({ ok: true })
      }

      const mem = extractMembership(evt)
      if (mem?.clerkOrgId && mem.clerkUserId) {
        const dbOrg = await orgService.getOrCreateByClerkOrgId(mem.clerkOrgId)

        await membersService.syncFromClerkMembership({
          action: evt.type.endsWith(".deleted") ? "delete" : "upsert",
          orgId: dbOrg.id,
          clerkUserId: mem.clerkUserId,
          clerkRole: mem.clerkRole ?? null,
          clerkStatus: mem.statusHint ?? null,
          eventCreatedAt,
        })

        return Response.json({ ok: true })
      }

      return Response.json({ ok: true })
    } catch (err) {
      return jsonError(err)
    }
  },

  // GET /api/webhooks/clerk
  async health() {
    return Response.json({ ok: true })
  },

  // OPTIONS /api/webhooks/clerk
  async options() {
    return new Response(null, { status: 204 })
  },
}
