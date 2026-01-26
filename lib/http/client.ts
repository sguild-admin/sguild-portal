// lib/http/client.ts
import type { ApiResponse, BootstrapPayload } from "@/lib/bootstrap/types"

let bootstrapPromise: Promise<BootstrapPayload> | null = null
let bootstrapValue: BootstrapPayload | null = null

async function fetchBootstrap(): Promise<BootstrapPayload> {
  const res = await fetch("/api/bootstrap", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
  })

  const json = (await res.json()) as ApiResponse<BootstrapPayload>

  if (!res.ok) throw new Error("Request failed")
  if (!json.ok) throw new Error(json.error || "Bootstrap failed")

  return json.data
}

export function getBootstrapOnce() {
  if (bootstrapValue) return Promise.resolve(bootstrapValue)
  if (!bootstrapPromise) {
    bootstrapPromise = fetchBootstrap().then((data) => {
      bootstrapValue = data
      return data
    })
  }
  return bootstrapPromise
}

export function clearBootstrapCache() {
  bootstrapPromise = null
  bootstrapValue = null
}
