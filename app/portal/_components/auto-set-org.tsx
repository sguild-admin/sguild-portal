"use client"

// app/portal/_components/auto-set-org.tsx
// Auto-select an org when the user has exactly one membership.
import { useEffect, useRef } from "react"
import { useClerk, useOrganizationList } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function AutoSetActiveOrg() {
  const { setActive } = useClerk()
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: { pageSize: 2 },
  })
  const router = useRouter()
  const didSetOrgRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    if (didSetOrgRef.current) return
    const memberships = userMemberships?.data ?? []
    if (memberships.length !== 1) return

    const orgId = memberships[0]?.organization?.id
    if (!orgId) return

    // Avoid repeating setActive on re-renders.
    didSetOrgRef.current = true

    setActive({ organization: orgId })
      .then(() => router.replace("/portal"))
      .catch(() => {
        // Reset guard so a future render can retry.
        didSetOrgRef.current = false
      })
  }, [isLoaded, router, setActive, userMemberships])

  return null
}
