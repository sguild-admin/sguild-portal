// lib/http/errors.ts

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL"

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(params: {
    code: ErrorCode
    status: number
    message: string
    details?: unknown
  }) {
    super(params.message)
    this.name = "AppError"
    this.code = params.code
    this.status = params.status
    this.details = params.details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super({ code: "UNAUTHORIZED", status: 401, message, details })
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super({ code: "FORBIDDEN", status: 403, message, details })
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super({ code: "NOT_FOUND", status: 404, message, details })
    this.name = "NotFoundError"
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super({ code: "BAD_REQUEST", status: 400, message, details })
    this.name = "BadRequestError"
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super({ code: "CONFLICT", status: 409, message, details })
    this.name = "ConflictError"
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Rate limited", details?: unknown) {
    super({ code: "RATE_LIMITED", status: 429, message, details })
    this.name = "RateLimitedError"
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}

export function toAppError(err: unknown): AppError {
  if (isAppError(err)) return err
  if (err instanceof Error) {
    return new AppError({
      code: "INTERNAL",
      status: 500,
      message: err.message || "Internal server error",
    })
  }
  return new AppError({
    code: "INTERNAL",
    status: 500,
    message: "Internal server error",
    details: err,
  })
}
