"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/app/portal/_components/PageHeader"
import CoachRosterManager from "@/app/portal/admin/_components/CoachRosterManager"

export default function Page() {
  const [inviteOpen, setInviteOpen] = useState(false)

  const handleInviteClick = () => {
    setInviteOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Coach roster"
        subtitle="Invite coaches, edit profiles, enable or disable access"
        actions={
          <Button
            type="button"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={handleInviteClick}
          >
            <UserPlus className="h-4 w-4" />Invite coach
          </Button>
        }
      />
      <CoachRosterManager
        inviteOpen={inviteOpen}
        onInviteOpenChange={setInviteOpen}
        onInviteClick={handleInviteClick}
      />
    </>
  )
}
