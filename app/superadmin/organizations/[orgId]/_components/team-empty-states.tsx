"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { UserPlus, UserX } from "lucide-react"

type EmptyStateCardProps = {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
  onAction?: () => void
}

export function EmptyStateCard({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/30 shadow-sm">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>

      {actionLabel && onAction ? (
        <Button size="sm" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  )
}

export function CoachesEmptyState({
  onInviteCoach,
}: {
  onInviteCoach: () => void
}) {
  return (
    <EmptyStateCard
      icon={UserPlus}
      title="No coaches to show"
      description="Create an invite to add a coach"
      actionLabel="Invite coach"
      onAction={onInviteCoach}
    />
  )
}

export function DisabledEmptyState() {
  return (
    <EmptyStateCard
      icon={UserX}
      title="No disabled staff to show"
      description="No one in this organization is currently disabled"
    />
  )
}
