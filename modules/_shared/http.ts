// modules/_shared/http.ts
// HTTP utilities for route handlers (parsing, responses, and error handling).
import { ZodError, type ZodSchema } from "zod"
import { AppError, HttpError, jsonErrorResponse, unknownToAppError } from "./errors"
import type { AppCtx } from "./ctx"

// Read JSON body and enforce content-type.
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

// Convenience wrapper for query params.
export function getQuery(req: Request): URLSearchParams {
  return new URL(req.url).searchParams
}

// 200 response with a standard ok envelope.
export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, ...data }, { status: init?.status ?? 200, headers: init?.headers })
}

// 201 response with a standard ok envelope.
export function created<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, ...data }, { status: init?.status ?? 201, headers: init?.headers })
}

// 204 response with empty body.
export function noContent(init?: ResponseInit): Response {
  return new Response(null, { status: init?.status ?? 204, headers: init?.headers })
}

// Throw a 400 AppError.
export function badRequest(code: string, message: string, details?: unknown): never {
  throw new HttpError(400, code, message, details)
}

// Throw a 401 AppError.
export function unauthorized(message = "Unauthorized"): never {
  throw new HttpError(401, "UNAUTHORIZED", message)
}

// Throw a 403 AppError.
export function forbidden(message = "Forbidden"): never {
  throw new HttpError(403, "FORBIDDEN", message)
}

// Throw a 404 AppError.
export function notFound(message = "Not found"): never {
  throw new HttpError(404, "NOT_FOUND", message)
}

// Throw a 409 AppError.
export function conflict(message = "Conflict"): never {
  throw new HttpError(409, "CONFLICT", message)
}

// Throw a 429 AppError.
export function tooManyRequests(message = "Too many requests"): never {
  throw new HttpError(429, "RATE_LIMITED", message)
}

// Throw a 500 AppError.
export function internal(message = "Internal error", details?: unknown): never {
  throw new HttpError(500, "INTERNAL_ERROR", message, details)
}

// Parse input with Zod, rethrowing errors as AppErrors.
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

// Convert query value to int with fallback.
export function asInt(v: string | null, fallback: number): number {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

// Convert query value to boolean with fallback.
export function asBool(v: string | null, fallback: boolean): boolean {
  if (v == null) return fallback
  if (v === "true") return true
  if (v === "false") return false
  return fallback
}

// Parse a query value as a string enum.
export function asEnum<T extends Record<string, string>>(e: T, v: string | null): T[keyof T] | undefined {
  if (!v) return undefined
  const values = Object.values(e)
  return values.includes(v) ? (v as T[keyof T]) : undefined
}

// Generic handler type used by module routes.
export type Handler = (req: Request, ctx?: unknown) => Promise<Response> | Response

/**
 * Wrap a Next.js Route Handler or your module route function:
 * - catches errors
 * - logs if ctx provided
 * - returns standardized JSON error responses
 */
// Wrapper that standardizes error handling and optional logging.
export function handler(
  fn: (req: Request, ctx?: unknown) => Promise<Response>,
  opts?: { getCtx?: (req: Request) => Promise<AppCtx> }
) {
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
