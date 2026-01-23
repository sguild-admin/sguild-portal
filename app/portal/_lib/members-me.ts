import { cache } from "react"
import { cookies, headers } from "next/headers"

export type MembersMeOk = {
  ok: true
  mode: "member" | "superadmin"
  org: { id: string; clerkOrgId: string; name: string } | null
  membership: { role: string } | null
}

export type MembersMeError = {
  ok: false
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  details?: unknown
  requestId?: string
}

export type MembersMeResponse = MembersMeOk | MembersMeError

async function getBaseUrl() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

export const getMembersMe = cache(async (): Promise<MembersMeResponse> => {
  const baseUrl = await getBaseUrl()
  const res = await fetch(`${baseUrl}/api/members/me`, {
    cache: "no-store",
    headers: {
      cookie: cookies().toString(),
    },
  })

  return (await res.json()) as MembersMeResponse
})
