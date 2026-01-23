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

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, GET, OPTIONS",
    },
  })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}