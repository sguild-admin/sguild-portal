// modules/_shared/errors.ts
import { ZodError } from "zod"

export type FieldErrors = Record<string, string[]>

export type ApiError = {
  ok: false
  code: string
  message: string
  fieldErrors?: FieldErrors
  details?: unknown
  requestId?: string
}

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
export class HttpError extends AppError {
  constructor(status: number, code: string, message: string, details?: unknown) {
    super({ status, code, message, details })
    this.name = "HttpError"
  }
}

export function isAppError(err: unknown): err is AppError {
  return !!err && typeof err === "object" && "status" in err && "code" in err
}

export function fieldErrorsFromZod(err: ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of err.issues) {
    const path = issue.path?.length ? issue.path.join(".") : "_"
    if (!out[path]) out[path] = []
    out[path].push(issue.message)
  }
  return out
}

export function fromZod(err: ZodError): AppError {
  return new AppError({
    status: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    fieldErrors: fieldErrorsFromZod(err),
    cause: err,
  })
}

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

export function jsonErrorResponse(err: unknown, opts?: { requestId?: string }): Response {
  const e = unknownToAppError(err)
  const body = toApiError(e, opts?.requestId)
  return Response.json(body, { status: e.status })
}

/**
 * Optional helper for guarding invariants
 */
export function invariant(condition: unknown, err: AppError): asserts condition {
  if (!condition) throw err
}
