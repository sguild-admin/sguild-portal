// modules/_shared/ctx.ts
import { PrismaClient } from "@prisma/client"
import { auth, clerkClient } from "@clerk/nextjs/server"

export type AuthInfo = {
  userId: string | null
  clerkOrgId: string | null
  orgRole: string | null
  sessionId: string | null
  sessionClaims: Record<string, unknown> | null
}

export type RequestInfo = {
  url: string
  path: string
  method: string
  ip: string | null
  userAgent: string | null
  requestId: string
}

export type Logger = {
  info: (msg: string, meta?: Record<string, unknown>) => void
  warn: (msg: string, meta?: Record<string, unknown>) => void
  error: (msg: string, meta?: Record<string, unknown>) => void
}

export type AppCtx = {
  prisma: PrismaClient
  auth: AuthInfo
  req: RequestInfo
  log: Logger
  clerk: typeof clerkClient
  now: () => Date
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") return new PrismaClient()
  if (!globalThis.__prisma) globalThis.__prisma = new PrismaClient()
  return globalThis.__prisma
}

function getHeader(req: Request, key: string): string | null {
  return req.headers.get(key)
}

function buildLogger(requestId: string): Logger {
  const prefix = `[${requestId}]`
  return {
    info: (msg, meta) => console.info(prefix, msg, meta ?? {}),
    warn: (msg, meta) => console.warn(prefix, msg, meta ?? {}),
    error: (msg, meta) => console.error(prefix, msg, meta ?? {}),
  }
}

function getRequestId(req: Request): string {
  const existing =
    getHeader(req, "x-request-id") ??
    getHeader(req, "x-vercel-id") ??
    getHeader(req, "cf-ray")

  return existing ?? crypto.randomUUID()
}

function getIp(req: Request): string | null {
  const xff = getHeader(req, "x-forwarded-for")
  if (!xff) return null
  const first = xff.split(",")[0]?.trim()
  return first || null
}

type ClerkAuth = Awaited<ReturnType<typeof auth>>

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
