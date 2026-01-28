// lib/auth/next-request-headers.ts
import { headers as nextHeaders } from "next/headers"

export async function getRequestHeaders(): Promise<Headers> {
  const h = await nextHeaders()
  const out = new Headers()
  for (const [k, v] of h.entries()) out.set(k, v)
  return out
}