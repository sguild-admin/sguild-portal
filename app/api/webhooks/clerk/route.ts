import { verifyClerkWebhook } from "@/lib/clerk"
import { syncFromClerkEvent as syncOrgEvent } from "@/modules/org/org.usecases"
import { syncFromClerkEvent as syncMembershipEvent } from "@/modules/memberships/memberships.usecases"

export async function POST(request: Request) {
  try {
    const event = await verifyClerkWebhook(request)

    let type = ""
    const ev = event as unknown
    if (typeof ev === "object" && ev !== null) {
      const e = ev as Record<string, unknown>
      if (typeof e.type === "string") type = e.type
      else if (typeof e.event === "string") type = e.event
    }

    // route quickly and keep handlers thin — delegate to usecases
    if (type) {
      const t = type.toString().toLowerCase()
      if (t.includes("organization") || t.includes("org")) {
        // do not await so we can ack quickly
        Promise.resolve(syncOrgEvent(event)).catch(() => {})
      } else if (t.includes("membership")) {
        Promise.resolve(syncMembershipEvent(event)).catch(() => {})
      }
    }

    return new Response(null, { status: 200 })
  } catch {
    return new Response(null, { status: 400 })
  }
}
