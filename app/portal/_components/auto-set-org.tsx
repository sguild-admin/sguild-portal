"use client"

import { useEffect } from "react"
import { useClerk, useOrganizationList } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function AutoSetActiveOrg() {
  const { setActive } = useClerk()
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: { pageSize: 2 },
  })
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    const memberships = userMemberships?.data ?? []
    if (memberships.length !== 1) return

    const orgId = memberships[0]?.organization?.id
    if (!orgId) return

    setActive({ organization: orgId })
      .then(() => router.replace("/portal"))
      .catch(() => null)
  }, [isLoaded, router, setActive, userMemberships])

  return null
}
