import { NextResponse } from "next/server"
import { AppError, isAppError, toAppError } from "./errors"

export type ApiOk<T> = { ok: true; data: T }
export type ApiFail = { ok: false; error: string; code?: string }
export type ApiResponse<T> = ApiOk<T> | ApiFail

export function toHttpStatus(err: unknown): number {
  if (isAppError(err)) return err.status
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
  const appErr = toAppError(err)

  return NextResponse.json(
    {
      ok: false,
      error: appErr.message,
      code: appErr.code,
    } satisfies ApiFail,
    { status: status ?? appErr.status }
  )
}
