// modules/_shared/http.ts
import { ZodError, type ZodSchema } from "zod"
import { AppError, HttpError, jsonErrorResponse, unknownToAppError } from "./errors"
import type { AppCtx } from "./ctx"

export async function parseJson(req: Request): Promise<unknown> {
  const ct = req.headers.get("content-type") ?? ""
  if (!ct.includes("application/json")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json")
  }

  try {
    return await req.json()
  } catch (err) {
    throw new HttpError(400, "INVALID_JSON", "Body must be valid JSON", err)
  }
}

export function getQuery(req: Request): URLSearchParams {
  return new URL(req.url).searchParams
}

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, ...data }, { status: init?.status ?? 200, headers: init?.headers })
}

export function created<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, ...data }, { status: init?.status ?? 201, headers: init?.headers })
}

export function noContent(init?: ResponseInit): Response {
  return new Response(null, { status: init?.status ?? 204, headers: init?.headers })
}

export function badRequest(code: string, message: string, details?: unknown): never {
  throw new HttpError(400, code, message, details)
}

export function unauthorized(message = "Unauthorized"): never {
  throw new HttpError(401, "UNAUTHORIZED", message)
}

export function forbidden(message = "Forbidden"): never {
  throw new HttpError(403, "FORBIDDEN", message)
}

export function notFound(message = "Not found"): never {
  throw new HttpError(404, "NOT_FOUND", message)
}

export function conflict(message = "Conflict"): never {
  throw new HttpError(409, "CONFLICT", message)
}

export function tooManyRequests(message = "Too many requests"): never {
  throw new HttpError(429, "RATE_LIMITED", message)
}

export function internal(message = "Internal error", details?: unknown): never {
  throw new HttpError(500, "INTERNAL_ERROR", message, details)
}

export function parseWith<T>(schema: ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input)
  } catch (err) {
    if (err instanceof ZodError) {
      throw AppError.prototype.isPrototypeOf(err)
        ? (err as unknown as AppError)
        : new HttpError(400, "VALIDATION_ERROR", "Invalid input", err)
    }
    throw err
  }
}

export function asInt(v: string | null, fallback: number): number {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

export function asBool(v: string | null, fallback: boolean): boolean {
  if (v == null) return fallback
  if (v === "true") return true
  if (v === "false") return false
  return fallback
}

export function asEnum<T extends Record<string, string>>(e: T, v: string | null): T[keyof T] | undefined {
  if (!v) return undefined
  const values = Object.values(e)
  return values.includes(v) ? (v as T[keyof T]) : undefined
}

export type Handler = (req: Request, ctx?: unknown) => Promise<Response> | Response

/**
 * Wrap a Next.js Route Handler or your module route function:
 * - catches errors
 * - logs if ctx provided
 * - returns standardized JSON error responses
 */
export function handler(fn: (req: Request, ctx?: unknown) => Promise<Response>, opts?: { getCtx?: (req: Request) => Promise<AppCtx> }) {
  return async (req: Request, ctx?: unknown) => {
    try {
      return await fn(req, ctx)
    } catch (err) {
      // If we can obtain ctx, include requestId and log
      if (opts?.getCtx) {
        try {
          const appCtx = await opts.getCtx(req)
          appCtx.log.error("request error", {
            path: appCtx.req.path,
            method: appCtx.req.method,
            code: unknownToAppError(err).code,
          })
          return jsonErrorResponse(err, { requestId: appCtx.req.requestId })
        } catch {
          return jsonErrorResponse(err)
        }
      }

      return jsonErrorResponse(err)
    }
  }
}
