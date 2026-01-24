"use client"

// app/portal/_components/org-change-refresh.tsx
// Refresh portal view when the active org changes.
import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function OrgChangeRefresh() {
  const { orgId, userId, isLoaded } = useAuth()
  const router = useRouter()
  const lastOrgId = useRef<string | null>(null)
  const lastUserId = useRef<string | null>(null)
  const pendingUserSwitch = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    const currentOrgId = orgId ?? null
    const currentUserId = userId ?? null
    if (lastOrgId.current === null && lastUserId.current === null) {
      lastOrgId.current = currentOrgId
      lastUserId.current = currentUserId
      return
    }
    const orgChanged = currentOrgId !== lastOrgId.current
    const userChanged = currentUserId !== lastUserId.current
    if (orgChanged || userChanged) {
      lastOrgId.current = currentOrgId
      lastUserId.current = currentUserId
      if (userChanged) {
        if (!currentUserId) {
          pendingUserSwitch.current = true
          return
        }
        window.location.assign("/portal")
        return
      }
      const handle = window.setTimeout(() => {
        router.replace("/portal")
        router.refresh()
      }, 150)
      return () => window.clearTimeout(handle)
    }

    if (pendingUserSwitch.current && currentUserId) {
      pendingUserSwitch.current = false
      window.location.assign("/portal")
    }
  }, [isLoaded, orgId, router, userId])

  return null
}
