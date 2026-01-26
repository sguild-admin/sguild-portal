// lib/http/errors.ts

export type AppErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "BAD_REQUEST" | "NOT_FOUND"

export class AppError extends Error {
  code: AppErrorCode

  constructor(code: AppErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
  }
}
