// lib/clerk.ts
import { auth } from "@clerk/nextjs/server"
import { UnauthorizedError, BadRequestError } from "@/lib/errors"
import env from "@/lib/env"

/**
 * Returns Clerk auth context for the current request (server action, route handler, server component).
 */
export async function getClerkAuth() {
  return auth()
}

export async function requireClerkUserId() {
  const a = await auth()
  if (!a.userId) throw new UnauthorizedError("Not signed in")
  return a.userId
}

export async function requireClerkOrgId() {
  const a = await auth()
  if (!a.userId) throw new UnauthorizedError("Not signed in")
  if (!a.orgId) throw new UnauthorizedError("No active organization")
  return a.orgId
}
 

export async function verifyClerkWebhook(request: Request): Promise<unknown> {
  const secret = env.CLERK_WEBHOOK_SECRET
  if (!secret) throw new BadRequestError("CLERK_WEBHOOK_SECRET is not set")

  // Clerk uses Svix headers
  const svixId = request.headers.get("svix-id")
  const svixTimestamp = request.headers.get("svix-timestamp")
  const svixSignature = request.headers.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new BadRequestError("Missing Svix headers")
  }

  const body = await request.text()


  const { Webhook } = await import("svix")

  const wh = new Webhook(secret)
  return wh.verify(body, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  })
}

