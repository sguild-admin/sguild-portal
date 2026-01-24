"use client"

// app/portal/_components/org-change-refresh.tsx
// Refresh portal view when the active org changes.
import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function OrgChangeRefresh() {
  const { orgId, isLoaded } = useAuth()
  const router = useRouter()
  const lastOrgId = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    const currentId = orgId ?? null
    if (lastOrgId.current === null) {
      lastOrgId.current = currentId
      return
    }
    if (currentId !== lastOrgId.current) {
      lastOrgId.current = currentId
      if (!currentId) return
      const handle = window.setTimeout(() => {
        router.replace("/portal")
        router.refresh()
      }, 150)
      return () => window.clearTimeout(handle)
    }
  }, [isLoaded, orgId, router])

  return null
}
