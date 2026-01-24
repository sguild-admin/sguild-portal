// modules/_shared/errors.ts
// Error types and helpers shared across modules and route handlers.
import { ZodError } from "zod"

// Validation errors keyed by field path.
export type FieldErrors = Record<string, string[]>

// Standard API error envelope returned to clients.
export type ApiError = {
  ok: false
  code: string
  message: string
  fieldErrors?: FieldErrors
  details?: unknown
  requestId?: string
}

// Canonical application error (HTTP-aware, serializable).
export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors?: FieldErrors
  readonly details?: unknown
  readonly cause?: unknown

  constructor(args: {
    status: number
    code: string
    message: string
    fieldErrors?: FieldErrors
    details?: unknown
    cause?: unknown
  }) {
    super(args.message)
    this.name = "AppError"
    this.status = args.status
    this.code = args.code
    this.fieldErrors = args.fieldErrors
    this.details = args.details
    this.cause = args.cause
  }
}

/**
 * Backwards compatible alias if you already throw HttpError elsewhere
 */
// Backwards compatible alias for AppError.
export class HttpError extends AppError {
  constructor(status: number, code: string, message: string, details?: unknown) {
    super({ status, code, message, details })
    this.name = "HttpError"
  }
}

// Narrow unknown errors to AppError instances.
export function isAppError(err: unknown): err is AppError {
  return !!err && typeof err === "object" && "status" in err && "code" in err
}

// Convert Zod issues into a map of field paths to messages.
export function fieldErrorsFromZod(err: ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of err.issues) {
    const path = issue.path?.length ? issue.path.join(".") : "_"
    if (!out[path]) out[path] = []
    out[path].push(issue.message)
  }
  return out
}

// Create a 400 AppError from a ZodError.
export function fromZod(err: ZodError): AppError {
  return new AppError({
    status: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    fieldErrors: fieldErrorsFromZod(err),
    cause: err,
  })
}

// Normalize any thrown value into an AppError.
export function unknownToAppError(err: unknown): AppError {
  if (isAppError(err)) return err
  if (err instanceof ZodError) return fromZod(err)

  if (err instanceof Error) {
    return new AppError({
      status: 500,
      code: "INTERNAL_ERROR",
      message: err.message || "Internal error",
      cause: err,
    })
  }

  return new AppError({
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Internal error",
    details: err,
  })
}

// Serialize an error into the API envelope.
export function toApiError(err: unknown, requestId?: string): ApiError {
  const e = unknownToAppError(err)
  return {
    ok: false,
    code: e.code,
    message: e.message,
    fieldErrors: e.fieldErrors,
    details: e.details,
    requestId,
  }
}

// Build a Response with the standardized error payload.
export function jsonErrorResponse(err: unknown, opts?: { requestId?: string }): Response {
  const e = unknownToAppError(err)
  const body = toApiError(e, opts?.requestId)
  return Response.json(body, { status: e.status })
}

/**
 * Optional helper for guarding invariants
 */
// Throw an AppError if a condition is falsy.
export function invariant(condition: unknown, err: AppError): asserts condition {
  if (!condition) throw err
}
