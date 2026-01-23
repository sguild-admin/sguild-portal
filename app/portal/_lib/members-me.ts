// app/portal/_lib/members-me.ts
import { cookies, headers } from "next/headers"

export type MembersMeOk = {
  ok: true
  org: { id: string; clerkOrgId: string; name: string }
  membership: { role: string }
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
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  if (!host) throw new Error("Missing host header")
  return `${proto}://${host}`
}

export async function getMembersMe(): Promise<MembersMeResponse> {
  const baseUrl = await getBaseUrl()
  const cookieStore = await cookies()

  const res = await fetch(`${baseUrl}/api/members/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
  })

  return (await res.json()) as MembersMeResponse
}
