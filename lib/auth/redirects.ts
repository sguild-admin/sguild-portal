// lib/auth/redirects.ts
import { redirect } from "next/navigation"
import { AppError } from "@/lib/http/errors"
import { getRequestHeaders } from "@/lib/auth/next-request-headers"
import { requireSession, requireActiveOrgId, requireSuperAdmin } from "@/lib/auth/guards"

export async function redirectIfSignedIn(to: string) {
  const reqHeaders = await getRequestHeaders()
  try {
    await requireSession(reqHeaders)
    redirect(to)
  } catch (err) {
    if (err instanceof AppError && err.code === "UNAUTHENTICATED") return
    throw err
  }
}

export async function requireSessionOrRedirect(to: string) {
  const reqHeaders = await getRequestHeaders()
  try {
    return await requireSession(reqHeaders)
  } catch (err) {
    if (err instanceof AppError && err.code === "UNAUTHENTICATED") redirect(to)
    throw err
  }
}

export async function requireActiveOrgOrRedirect(to: string) {
  const reqHeaders = await getRequestHeaders()
  try {
    await requireSession(reqHeaders)
    return await requireActiveOrgId(reqHeaders)
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHENTICATED") redirect("/sign-in")
      // missing active org
      if (err.code === "BAD_REQUEST") redirect(to)
    }
    throw err
  }
}

export async function requireSuperAdminOrRedirect(to: string) {
  const reqHeaders = await getRequestHeaders()
  try {
    await requireSession(reqHeaders)
    return await requireSuperAdmin(reqHeaders)
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHENTICATED") redirect("/sign-in")
      if (err.code === "FORBIDDEN") redirect(to)
    }
    throw err
  }
}
