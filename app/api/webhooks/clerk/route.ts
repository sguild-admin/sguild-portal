// app/api/webhooks/clerk/route.ts
export const runtime = "nodejs"

import { verifyClerkWebhook } from "@/lib/clerk"
import { jsonError } from "@/lib/errors"

export async function POST(request: Request) {
  try {
    const event = await verifyClerkWebhook(request)

    // TODO: call your org/membership sync use cases based on event.type

    return Response.json({ ok: true })
  } catch (err) {
    return jsonError(err)
  }
}

// optional: helps you sanity check in browser
export async function GET() {
  return Response.json({ ok: true })
}