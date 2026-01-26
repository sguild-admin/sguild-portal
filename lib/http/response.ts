import { NextResponse } from "next/server"
import { AppError } from "./errors"

export type ApiOk<T> = { ok: true; data: T }
export type ApiFail = { ok: false; error: string; code?: string }
export type ApiResponse<T> = ApiOk<T> | ApiFail

export function toHttpStatus(err: unknown) {
  if (err instanceof AppError) {
    if (err.code === "UNAUTHENTICATED") return 401
    if (err.code === "FORBIDDEN") return 403
    if (err.code === "NOT_FOUND") return 404
    if (err.code === "BAD_REQUEST") return 400
  }
  return 500
}

export function getErrorMessage(err: unknown): string {
  if (!err) return "Error"
  if (typeof err === "string") return err
  if (err instanceof Error) return err.message || "Error"

  try {
    return JSON.stringify(err)
  } catch {
    return "Error"
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data } satisfies ApiOk<T>, { status })
}

export function fail(err: unknown, status?: number) {
  const message = err instanceof Error ? err.message : getErrorMessage(err)
  const code = err instanceof AppError ? err.code : undefined

  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
    } satisfies ApiFail,
    { status: status ?? toHttpStatus(err) }
  )
}
