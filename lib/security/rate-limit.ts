// lib/security/rate-limit.ts
import { headers } from "next/headers"
import { prisma } from "@/lib/db/prisma"
import { AppError } from "@/lib/http/errors"

/**
 * Minimal DB-backed rate limiter
 * - Works on server actions + route handlers
 * - No external infra
 * - Good enough for auth endpoints and public forms
 *
 * Requires a Prisma model:
 *
 * model RateLimit {
 *   key        String  @id
 *   count      Int     @default(0)
 *   windowEnds DateTime
 * }
 */
export async function rateLimit(params: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = new Date()
  const windowEnds = new Date(now.getTime() + params.windowMs)

  const row = await prisma.rateLimit.findUnique({
    where: { key: params.key },
  })

  if (!row) {
    await prisma.rateLimit.create({
      data: { key: params.key, count: 1, windowEnds },
    })
    return { ok: true, remaining: params.limit - 1 }
  }

  if (row.windowEnds <= now) {
    await prisma.rateLimit.update({
      where: { key: params.key },
      data: { count: 1, windowEnds },
    })
    return { ok: true, remaining: params.limit - 1 }
  }

  if (row.count >= params.limit) {
    throw new AppError("BAD_REQUEST", "Too many requests")
  }

  await prisma.rateLimit.update({
    where: { key: params.key },
    data: { count: { increment: 1 } },
  })

  return { ok: true, remaining: params.limit - (row.count + 1) }
}

/**
 * Helper to rate limit by IP. Good for sign-in, sign-up, and public forms.
 */
export async function rateLimitByIp(params: {
  prefix: string
  limit: number
  windowMs: number
}) {
  const h = await headers()
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"

  return rateLimit({
    key: `${params.prefix}:${ip}`,
    limit: params.limit,
    windowMs: params.windowMs,
  })
}
