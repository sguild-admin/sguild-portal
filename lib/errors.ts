// lib/errors.ts
export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "INTERNAL"

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ErrorCode, status: number, message: string, details?: unknown) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super("UNAUTHORIZED", 401, message, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super("FORBIDDEN", 403, message, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super("NOT_FOUND", 404, message, details)
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super("BAD_REQUEST", 400, message, details)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super("CONFLICT", 409, message, details)
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof Error) return new AppError("INTERNAL", 500, err.message)
  return new AppError("INTERNAL", 500, "Unknown error")
}

export function jsonError(err: unknown) {
  const e = toAppError(err)
  return Response.json(
    { error: { code: e.code, message: e.message, details: e.details } },
    { status: e.status },
  )
}
