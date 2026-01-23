// modules/webhooks/webhooks.routes.ts
import "server-only"

import { verifyClerkWebhook } from "@/modules/webhooks/clerk.webhooks"
import { buildCtx } from "@/modules/_shared/ctx"
import { handleClerkEventAction } from "@/modules/webhooks/webhooks.actions"
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

      const ctx = await buildCtx(request)

      await handleClerkEventAction({
        ctx,
        event: { id: (evt as any).id, type: (evt as any).type, data: (evt as any).data },
        eventCreatedAt,
      })

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
