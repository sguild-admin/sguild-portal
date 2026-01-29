"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export type BootstrapData = {
  signedIn: boolean
  user: { id: string; email?: string | null; name?: string | null } | null
  session: {
    id?: string | null
    activeOrganizationId: string | null
    expiresAt?: string | null
  } | null
  activeOrg: any | null
  roles: string[]
  activeOrgMember: { role: string; status: "ACTIVE" | "DISABLED" } | null
  activeCoach: { status: "ACTIVE" | "DISABLED" } | null
  canAccessOrg: boolean
  isAdmin: boolean
  isCoach: boolean
  orgSettings: any | null
  superAdmin: boolean
}

type BootstrapState = {
  data: BootstrapData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const BootstrapContext = createContext<BootstrapState | null>(null)

let cached: BootstrapData | null = null
let inflight: Promise<BootstrapData> | null = null

async function fetchBootstrapUncached(): Promise<BootstrapData> {
  const r = await fetch("/api/bootstrap", {
    cache: "no-store",
    credentials: "include",
  })

  if (!r.ok) {
    if (r.status === 401) throw new Error("UNAUTHENTICATED")
    throw new Error(`BOOTSTRAP_HTTP_${r.status}`)
  }

  const json = await r.json()
  if (!json?.ok) {
    throw new Error(json?.error?.message ?? "BOOTSTRAP_ERROR")
  }

  const data = (json.data ?? null) as BootstrapData | null
  if (!data) throw new Error("Invalid bootstrap response")

  return data
}

async function fetchBootstrap(): Promise<BootstrapData> {
  if (cached) return cached
  if (inflight) return inflight

  inflight = fetchBootstrapUncached()
    .then((data) => {
      cached = data
      return data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function BootstrapProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapData | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    try {
      cached = null
      const next = await fetchBootstrap()
      setData(next)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bootstrap failed"

      cached = null
      setData(null)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cached) return
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<BootstrapState>(
    () => ({ data, loading, error, refresh }),
    [data, loading, error]
  )

  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>
}

export function useBootstrap() {
  const ctx = useContext(BootstrapContext)
  if (!ctx) throw new Error("useBootstrap must be used within BootstrapProvider")
  return ctx
}
