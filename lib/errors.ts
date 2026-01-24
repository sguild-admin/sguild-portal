// lib/errors.ts
// Lightweight error helpers for app-level HTTP responses.
// Error codes used in API responses.
export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "INTERNAL"

// Base error carrying HTTP status and optional details.
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

// 401 Unauthorized error.
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super("UNAUTHORIZED", 401, message, details)
  }
}

// 403 Forbidden error.
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super("FORBIDDEN", 403, message, details)
  }
}

// 404 Not Found error.
export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super("NOT_FOUND", 404, message, details)
  }
}

// 400 Bad Request error.
export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super("BAD_REQUEST", 400, message, details)
  }
}

// 409 Conflict error.
export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super("CONFLICT", 409, message, details)
  }
}

// Normalize unknown errors into AppError.
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof Error) return new AppError("INTERNAL", 500, err.message)
  return new AppError("INTERNAL", 500, "Unknown error")
}

// Convert an AppError to a standardized JSON response.
export function jsonError(err: unknown) {
  const e = toAppError(err)
  return Response.json(
    { error: { code: e.code, message: e.message, details: e.details } },
    { status: e.status },
  )
}
