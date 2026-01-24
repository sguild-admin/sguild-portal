// modules/_shared/ctx.ts
// Builds a standardized request context used by module route handlers.
import type { PrismaClient } from "@prisma/client"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/db/client"

// Normalized auth details extracted from Clerk.
export type AuthInfo = {
  userId: string | null
  clerkOrgId: string | null
  orgRole: string | null
  sessionId: string | null
  sessionClaims: Record<string, unknown> | null
}

// Request metadata useful for logging and tracing.
export type RequestInfo = {
  url: string
  path: string
  method: string
  ip: string | null
  userAgent: string | null
  requestId: string
}

// Minimal logger contract (swapable in tests).
export type Logger = {
  info: (msg: string, meta?: Record<string, unknown>) => void
  warn: (msg: string, meta?: Record<string, unknown>) => void
  error: (msg: string, meta?: Record<string, unknown>) => void
}

// The context injected into handlers for auth, logging, and infra access.
export type AppCtx = {
  prisma: PrismaClient
  auth: AuthInfo
  req: RequestInfo
  log: Logger
  clerk: typeof clerkClient
  now: () => Date
}

// Keep Prisma access in one place for easier mocking in tests.
function getPrisma(): PrismaClient {
  return prisma
}

// Safe helper for request header lookup.
function getHeader(req: Request, key: string): string | null {
  return req.headers.get(key)
}

// Prefix all logs with a request id for traceability.
function buildLogger(requestId: string): Logger {
  const prefix = `[${requestId}]`
  return {
    info: (msg, meta) => console.info(prefix, msg, meta ?? {}),
    warn: (msg, meta) => console.warn(prefix, msg, meta ?? {}),
    error: (msg, meta) => console.error(prefix, msg, meta ?? {}),
  }
}

// Prefer existing request id headers; fall back to a generated UUID.
function getRequestId(req: Request): string {
  const existing =
    getHeader(req, "x-request-id") ??
    getHeader(req, "x-vercel-id") ??
    getHeader(req, "cf-ray")

  return existing ?? crypto.randomUUID()
}

// Extract the first IP address from X-Forwarded-For.
function getIp(req: Request): string | null {
  const xff = getHeader(req, "x-forwarded-for")
  if (!xff) return null
  const first = xff.split(",")[0]?.trim()
  return first || null
}

type ClerkAuth = Awaited<ReturnType<typeof auth>>

// Main entrypoint: build context from a Next.js Request.
export async function buildCtx(req: Request): Promise<AppCtx> {
  const prisma = getPrisma()

  const requestId = getRequestId(req)
  const log = buildLogger(requestId)

  const url = new URL(req.url)

  const a: ClerkAuth = await auth()

  return {
    prisma,
    clerk: clerkClient,
    now: () => new Date(),
    auth: {
      userId: a.userId ?? null,
      clerkOrgId: (a.orgId as string | null) ?? null,
      orgRole: (a.orgRole as string | null) ?? null,
      sessionId: (a.sessionId as string | null) ?? null,
      sessionClaims:
        (a.sessionClaims as Record<string, unknown> | null) ?? null,
    },
    req: {
      url: req.url,
      path: url.pathname,
      method: req.method,
      ip: getIp(req),
      userAgent: getHeader(req, "user-agent"),
      requestId,
    },
    log,
  }
}
