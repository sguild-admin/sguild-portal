"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CoachDetailsPane from "@/app/portal/admin/_components/CoachDetailsPane"
import CoachRosterPane from "@/app/portal/admin/_components/CoachRosterPane"
import InviteCoachDialog from "@/app/portal/admin/_components/InviteCoachDialog"

const ACTIVE_STATUS = "ACTIVE"
const DISABLED_STATUS = "DISABLED"

type CoachProfile = {
  bio: string | null
  notes: string | null
  zip: string | null
  phone: string | null
}

type CoachUser = {
  id: string
  clerkUserId: string
  primaryEmail: string | null
  firstName: string | null
  lastName: string | null
  displayName: string | null
  coachProfile?: CoachProfile | null
}

type CoachMember = {
  id: string
  orgId: string
  clerkUserId: string
  role: "ADMIN" | "COACH"
  status: "ACTIVE" | "DISABLED"
  user?: CoachUser | null
}

type OrgInvite = {
  id: string
  clerkInvitationId: string
  email: string
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
  lastSentAt: string | null
  expiresAt: string | null
  acceptedAt?: string | null
}

type ApiOk<T> = { ok: true } & T

type ApiError = {
  ok: false
  code?: string
  message?: string
  details?: unknown
}

type MembersResponse = ApiOk<{ members: CoachMember[] }>

type InviteListResponse = ApiOk<{ invites: OrgInvite[] }>

type ProfileResponse = ApiOk<{ profile: CoachProfile | null }>

type PatchProfileResponse = ApiOk<{ profile: CoachProfile }>

type RosterItem =
  | { kind: "member"; member: CoachMember }
  | { kind: "invite"; invite: OrgInvite }

function formatDate(value: string | null): string {
  if (!value) return "—"
  const dt = new Date(value)
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString()
}

function formatPhone(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function apiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback
  const err = payload as ApiError
  const message = typeof err.message === "string" ? err.message.trim() : ""
  const code = typeof err.code === "string" ? err.code.trim() : ""
  const details = typeof err.details === "string" ? err.details.trim() : ""
  if (code && message) return `${code}: ${message}`
  if (message) return message
  if (code) return code
  if (details) return details
  return fallback
}

function coachDisplayName(coach: CoachMember): string {
  const user = coach.user
  if (!user) return coach.clerkUserId
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.primaryEmail ||
    coach.clerkUserId
  )
}

function coachFullName(coach: CoachMember): string {
  const user = coach.user
  if (!user) return coach.clerkUserId
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
  return fullName || user.displayName || user.primaryEmail || coach.clerkUserId
}

function coachEmail(coach: CoachMember): string {
  return coach.user?.primaryEmail || "—"
}

function coachPhone(coach: CoachMember): string | null {
  return coach.user?.coachProfile?.phone ?? null
}

function rosterItemId(item: RosterItem): string {
  return item.kind === "member" ? item.member.id : item.invite.id
}

function rosterItemName(item: RosterItem): string {
  return item.kind === "member" ? coachDisplayName(item.member) : item.invite.email
}

function rosterItemEmail(item: RosterItem): string {
  return item.kind === "member" ? coachEmail(item.member) : item.invite.email
}

function rosterItemStatus(item: RosterItem): "ACTIVE" | "DISABLED" | "INVITED" {
  if (item.kind === "invite") return "INVITED"
  return item.member.status
}

function inviteDisplayStatus(invite: OrgInvite): "INVITED" | "PENDING" {
  return invite.acceptedAt ? "PENDING" : "INVITED"
}

function statusLabel(status: "ACTIVE" | "DISABLED" | "INVITED"): string {
  if (status === "INVITED") return "Invited"
  return status === "ACTIVE" ? "Active" : "Disabled"
}

export default function CoachRosterManager({
  inviteOpen,
  onInviteOpenChange,
  onInviteClick,
}: {
  inviteOpen: boolean
  onInviteOpenChange: (open: boolean) => void
  onInviteClick: () => void
}) {
  const [coaches, setCoaches] = useState<CoachMember[]>([])
  const [invites, setInvites] = useState<OrgInvite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "DISABLED">("ACTIVE")
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccessEmail, setInviteSuccessEmail] = useState<string | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"coaches" | "details">("coaches")

  const [selectedItem, setSelectedItem] = useState<RosterItem | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [displayNameDraft, setDisplayNameDraft] = useState("")
  const [displayNameInitial, setDisplayNameInitial] = useState("")
  const [profileDraft, setProfileDraft] = useState<CoachProfile>({
    bio: "",
    notes: "",
    zip: "",
    phone: "",
  })
  const [profileInitial, setProfileInitial] = useState<CoachProfile>({
    bio: "",
    notes: "",
    zip: "",
    phone: "",
  })
  const [profileSaving, setProfileSaving] = useState(false)

  const rosterUrl = useMemo(() => {
    const params = new URLSearchParams({ role: "COACH" })
    return `/api/members?${params.toString()}`
  }, [])

  const inviteListUrl = useMemo(() => {
    const params = new URLSearchParams({ take: "50" })
    return `/api/org-invites?${params.toString()}`
  }, [])

  const loadRoster = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(rosterUrl, { cache: "no-store" })
      const data = (await res.json()) as MembersResponse
      if (!res.ok || !data.ok) throw new Error("Failed to load coaches")
      setCoaches(data.members)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load coaches"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [rosterUrl])

  const loadInvites = useCallback(async () => {
    try {
      const res = await fetch(inviteListUrl, { cache: "no-store" })
      const data = (await res.json()) as InviteListResponse
      if (!res.ok || !data.ok) throw new Error("Failed to load invites")
      setInvites(data.invites)
      return data.invites
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load invites"
      setError(message)
      toast.error(message)
      return [] as OrgInvite[]
    }
  }, [inviteListUrl])

  useEffect(() => {
    void loadRoster()
  }, [loadRoster])

  useEffect(() => {
    void loadInvites()
  }, [loadInvites])

  useEffect(() => {
    setSelectedItem(prev => {
      if (!prev || prev.kind !== "member") return prev
      const refreshed = coaches.find(member => member.id === prev.member.id)
      if (!refreshed || refreshed === prev.member) return prev
      return { kind: "member", member: refreshed }
    })
  }, [coaches])

  useEffect(() => {
    if (selectedItem) {
      setActiveTab("details")
    }
  }, [selectedItem])

  useEffect(() => {
    const onClick = () => setMenuOpenId(null)
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (inviteOpen) {
      setInviteError(null)
      setInviteSuccessEmail(null)
    }
  }, [inviteOpen])

  const handleSendInvite = async () => {
    const trimmedEmail = inviteEmail.trim()
    if (!trimmedEmail) {
      setInviteError("Email is required")
      return
    }
    setInviteError(null)
    setInviteSending(true)
    setError(null)

    try {
      const res = await fetch("/api/org-invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          redirectUrl: "https://portal.sguildswim.com/sign-up",
        }),
      })
      const payload = (await res.json()) as ApiOk<unknown> | ApiError
      if (!res.ok || !payload.ok) {
        throw new Error(apiErrorMessage(payload, "Failed to send invite"))
      }
      setInviteEmail("")
      setInviteName("")
      await loadInvites()
      setInviteSuccessEmail(trimmedEmail)
      setTimeout(() => {
        onInviteOpenChange(false)
        setInviteSuccessEmail(null)
      }, 800)
      toast.success("Invite sent")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invite"
      setError(message)
      toast.error(message)
    } finally {
      setInviteSending(false)
    }
  }

  const handleResendInvite = async (invite: OrgInvite) => {
    setError(null)
    try {
      const res = await fetch(`/api/org-invites/${invite.clerkInvitationId}/resend`, {
        method: "POST",
      })
      let payload: ApiOk<unknown> | ApiError | null = null
      try {
        payload = (await res.json()) as ApiOk<unknown> | ApiError
      } catch (err) {
        payload = null
      }
      if (!res.ok || (payload && !payload.ok)) {
        throw new Error(apiErrorMessage(payload, "Failed to resend invite"))
      }
      await loadInvites()
      toast.success("Invite resent")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend invite"
      setError(message)
      toast.error(message)
    }
  }

  const handleToggleStatus = async (coach: CoachMember) => {
    const nextStatus = coach.status === ACTIVE_STATUS ? DISABLED_STATUS : ACTIVE_STATUS
    setError(null)
    try {
      const res = await fetch(`/api/members/${coach.clerkUserId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      await loadRoster()
      toast.success(nextStatus === ACTIVE_STATUS ? "Coach enabled" : "Coach disabled")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status"
      setError(message)
      toast.error(message)
    }
  }

  const handleSelectCoach = async (coach: CoachMember) => {
    setSelectedItem({ kind: "member", member: coach })
    const defaultDisplayName = coachDisplayName(coach)
    setDisplayNameDraft(defaultDisplayName)
    setDisplayNameInitial(defaultDisplayName)
    const initialDraft = {
      bio: coach.user?.coachProfile?.bio ?? "",
      notes: coach.user?.coachProfile?.notes ?? "",
      zip: coach.user?.coachProfile?.zip ?? "",
      phone: coach.user?.coachProfile?.phone ?? "",
    }
    setProfileDraft(initialDraft)
    setProfileInitial(initialDraft)
    setDetailsLoading(true)

    try {
      const res = await fetch(`/api/coach-profiles/${coach.clerkUserId}`, {
        cache: "no-store",
      })
      const data = (await res.json()) as ProfileResponse
      if (res.ok && data.ok && data.profile) {
        const nextDraft = {
          bio: data.profile.bio ?? "",
          notes: data.profile.notes ?? "",
          zip: data.profile.zip ?? "",
          phone: data.profile.phone ?? "",
        }
        setProfileDraft(nextDraft)
        setProfileInitial(nextDraft)
      }
    } catch (err) {
      // Keep draft from list data if fetch fails.
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleSelectInvite = (invite: OrgInvite) => {
    setSelectedItem({ kind: "invite", invite })
    setDetailsLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!selectedItem || selectedItem.kind !== "member") return
    setProfileSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/coach-profiles/${selectedItem.member.clerkUserId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: displayNameDraft.trim() ? displayNameDraft.trim() : null,
          bio: profileDraft.bio?.trim() ? profileDraft.bio : null,
          notes: profileDraft.notes?.trim() ? profileDraft.notes : null,
          zip: profileDraft.zip?.trim() ? profileDraft.zip : null,
          phone: profileDraft.phone?.trim() ? profileDraft.phone : null,
        }),
      })
      const data = (await res.json()) as PatchProfileResponse
      if (!res.ok || !data.ok) throw new Error("Failed to save coach profile")
      await loadRoster()
      setDisplayNameInitial(displayNameDraft)
      setProfileInitial({
        bio: data.profile.bio ?? "",
        notes: data.profile.notes ?? "",
        zip: data.profile.zip ?? "",
        phone: data.profile.phone ?? "",
      })
      toast.success("Coach profile updated")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save coach profile"
      setError(message)
      toast.error(message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handleCancelProfile = () => {
    setDisplayNameDraft(displayNameInitial)
    setProfileDraft(profileInitial)
  }

  const isProfileDirty = useMemo(() => {
    return (
      displayNameDraft !== displayNameInitial ||
      profileDraft.bio !== profileInitial.bio ||
      profileDraft.notes !== profileInitial.notes ||
      profileDraft.zip !== profileInitial.zip ||
      profileDraft.phone !== profileInitial.phone
    )
  }, [displayNameDraft, displayNameInitial, profileDraft, profileInitial])

  const activeCoaches = useMemo(
    () => coaches.filter(coach => coach.status === ACTIVE_STATUS),
    [coaches]
  )
  const disabledCoaches = useMemo(
    () => coaches.filter(coach => coach.status === DISABLED_STATUS),
    [coaches]
  )

  const rosterItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const matchesSearch = (item: RosterItem) => {
      if (!normalizedSearch) return true
      const name = rosterItemName(item).toLowerCase()
      const email = rosterItemEmail(item).toLowerCase()
      return name.includes(normalizedSearch) || email.includes(normalizedSearch)
    }

    const items: RosterItem[] = []
    if (statusFilter === "DISABLED") {
      items.push(...disabledCoaches.map(member => ({ kind: "member" as const, member })))
    } else {
      items.push(...activeCoaches.map(member => ({ kind: "member" as const, member })))
    }

    return items.filter(matchesSearch)
  }, [activeCoaches, disabledCoaches, search, statusFilter])

  const totalRosterCount = activeCoaches.length + disabledCoaches.length
  const filtersDisabled = totalRosterCount === 0

  const handleToggleMembership = async (coach: CoachMember) => {
    const nextStatus = coach.status === ACTIVE_STATUS ? DISABLED_STATUS : ACTIVE_STATUS
    const confirmed = window.confirm(
      nextStatus === ACTIVE_STATUS
        ? "Enable this coach? They will regain access to the portal."
        : "Disable this coach? They will lose access to the portal."
    )
    if (!confirmed) return
    await handleToggleStatus(coach)
  }

  const rosterRows = rosterItems.map(item => ({
    id: rosterItemId(item),
    name: rosterItemName(item),
    email:
      item.kind === "member"
        ? coachPhone(item.member)
          ? formatPhone(coachPhone(item.member) ?? "")
          : rosterItemEmail(item)
        : rosterItemEmail(item),
    status: item.kind === "invite" ? inviteDisplayStatus(item.invite) : rosterItemStatus(item),
    lastSentLabel: item.kind === "invite" ? formatDate(item.invite.lastSentAt) : null,
    isInvite: item.kind === "invite",
    member: item.kind === "member" ? item.member : null,
    invite: item.kind === "invite" ? item.invite : null,
  }))

  const selectedMember = selectedItem?.kind === "member" ? selectedItem.member : null
  const selectedInvite = selectedItem?.kind === "invite" ? selectedItem.invite : null
  const selectedInviteStatus = selectedInvite ? inviteDisplayStatus(selectedInvite) : "INVITED"

  return (
    <div className="space-y-8">
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="lg:hidden space-y-4">
        {isMounted ? (
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as "coaches" | "details")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="coaches" className="flex-1">
                Coaches
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
            </TabsList>
            <TabsContent value="coaches">
              <CoachRosterPane
                totalRosterCount={totalRosterCount}
                search={search}
                onSearchChange={setSearch}
                filtersDisabled={filtersDisabled}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                activeCount={activeCoaches.length}
                disabledCount={disabledCoaches.length}
                isLoading={isLoading}
                rows={rosterRows}
                selectedId={selectedItem ? rosterItemId(selectedItem) : null}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onInviteClick={onInviteClick}
                onSelectRow={id => {
                  const row = rosterRows.find(item => item.id === id)
                  if (!row) return
                  if (row.isInvite && row.invite) handleSelectInvite(row.invite)
                  if (!row.isInvite && row.member) handleSelectCoach(row.member)
                }}
                onEditRow={id => {
                  const row = rosterRows.find(item => item.id === id)
                  if (row?.member) handleSelectCoach(row.member)
                }}
                onToggleRow={id => {
                  const row = rosterRows.find(item => item.id === id)
                  if (row?.member) void handleToggleMembership(row.member)
                }}
                onResendInvite={id => {
                  const row = rosterRows.find(item => item.id === id)
                  if (row?.invite) void handleResendInvite(row.invite)
                }}
              />
            </TabsContent>
            <TabsContent value="details">
              <CoachDetailsPane
                selectedMember={
                  selectedMember
                    ? { clerkUserId: selectedMember.clerkUserId, status: selectedMember.status }
                    : null
                }
                selectedInvite={
                  selectedInvite
                      ? {
                          status: inviteDisplayStatus(selectedInvite),
                          lastSentLabel: formatDate(selectedInvite.lastSentAt),
                          expiresLabel: formatDate(selectedInvite.expiresAt),
                        }
                    : null
                }
                detailsLoading={detailsLoading}
                displayName={selectedMember ? displayNameDraft : selectedInvite?.email || "Coach"}
                headerName={
                  selectedMember ? coachFullName(selectedMember) : selectedInvite?.email || "Coach"
                }
                email={selectedMember ? coachEmail(selectedMember) : "Invite pending"}
                status={selectedInvite ? selectedInviteStatus : selectedMember?.status ?? "INVITED"}
                membershipStatusLabel={
                  selectedMember
                    ? statusLabel(selectedMember.status)
                    : selectedInviteStatus === "PENDING"
                      ? "Pending"
                      : "Invited"
                }
                profileDraft={profileDraft}
                onProfileChange={setProfileDraft}
                isProfileDirty={isProfileDirty}
                profileSaving={profileSaving}
                onCancel={handleCancelProfile}
                onSave={handleSaveProfile}
                onToggleStatus={() => {
                  if (selectedMember) void handleToggleMembership(selectedMember)
                }}
                onResendInvite={() => {
                  if (selectedInvite) void handleResendInvite(selectedInvite)
                }}
                onDisplayNameChange={setDisplayNameDraft}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <CoachRosterPane
            totalRosterCount={totalRosterCount}
            search={search}
            onSearchChange={setSearch}
            filtersDisabled={filtersDisabled}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            activeCount={activeCoaches.length}
            disabledCount={disabledCoaches.length}
            isLoading={isLoading}
            rows={rosterRows}
            selectedId={selectedItem ? rosterItemId(selectedItem) : null}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            onInviteClick={onInviteClick}
            onSelectRow={id => {
              const row = rosterRows.find(item => item.id === id)
              if (!row) return
              if (row.isInvite && row.invite) handleSelectInvite(row.invite)
              if (!row.isInvite && row.member) handleSelectCoach(row.member)
            }}
            onEditRow={id => {
              const row = rosterRows.find(item => item.id === id)
              if (row?.member) handleSelectCoach(row.member)
            }}
            onToggleRow={id => {
              const row = rosterRows.find(item => item.id === id)
              if (row?.member) void handleToggleMembership(row.member)
            }}
            onResendInvite={id => {
              const row = rosterRows.find(item => item.id === id)
              if (row?.invite) void handleResendInvite(row.invite)
            }}
          />
        )}
      </div>

      <div className="hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-[380px_1fr]">
        <CoachRosterPane
          totalRosterCount={totalRosterCount}
          search={search}
          onSearchChange={setSearch}
          filtersDisabled={filtersDisabled}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          activeCount={activeCoaches.length}
          disabledCount={disabledCoaches.length}
          isLoading={isLoading}
          rows={rosterRows}
          selectedId={selectedItem ? rosterItemId(selectedItem) : null}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onInviteClick={onInviteClick}
          onSelectRow={id => {
            const row = rosterRows.find(item => item.id === id)
            if (!row) return
            if (row.isInvite && row.invite) handleSelectInvite(row.invite)
            if (!row.isInvite && row.member) handleSelectCoach(row.member)
          }}
          onEditRow={id => {
            const row = rosterRows.find(item => item.id === id)
            if (row?.member) handleSelectCoach(row.member)
          }}
          onToggleRow={id => {
            const row = rosterRows.find(item => item.id === id)
            if (row?.member) void handleToggleMembership(row.member)
          }}
          onResendInvite={id => {
            const row = rosterRows.find(item => item.id === id)
            if (row?.invite) void handleResendInvite(row.invite)
          }}
        />
        <CoachDetailsPane
          selectedMember={
            selectedMember
              ? { clerkUserId: selectedMember.clerkUserId, status: selectedMember.status }
              : null
          }
          selectedInvite={
            selectedInvite
              ? {
                  status: inviteDisplayStatus(selectedInvite),
                  lastSentLabel: formatDate(selectedInvite.lastSentAt),
                  expiresLabel: formatDate(selectedInvite.expiresAt),
                }
              : null
          }
          detailsLoading={detailsLoading}
          displayName={selectedMember ? displayNameDraft : selectedInvite?.email || "Coach"}
          headerName={
            selectedMember ? coachFullName(selectedMember) : selectedInvite?.email || "Coach"
          }
          email={selectedMember ? coachEmail(selectedMember) : "Invite pending"}
          status={selectedInvite ? selectedInviteStatus : selectedMember?.status ?? "INVITED"}
          membershipStatusLabel={
            selectedMember
              ? statusLabel(selectedMember.status)
              : selectedInviteStatus === "PENDING"
                ? "Pending"
                : "Invited"
          }
          profileDraft={profileDraft}
          onProfileChange={setProfileDraft}
          isProfileDirty={isProfileDirty}
          profileSaving={profileSaving}
          onCancel={handleCancelProfile}
          onSave={handleSaveProfile}
          onToggleStatus={() => {
            if (selectedMember) void handleToggleMembership(selectedMember)
          }}
          onResendInvite={() => {
            if (selectedInvite) void handleResendInvite(selectedInvite)
          }}
          onDisplayNameChange={setDisplayNameDraft}
        />
      </div>
      <InviteCoachDialog
        open={inviteOpen}
        inviteEmail={inviteEmail}
        inviteName={inviteName}
        inviteError={inviteError}
        inviteSending={inviteSending}
        inviteSuccessEmail={inviteSuccessEmail}
        onInviteEmailChange={setInviteEmail}
        onInviteNameChange={setInviteName}
        onClose={() => onInviteOpenChange(false)}
        onSend={handleSendInvite}
      />
    </div>
  )
}
