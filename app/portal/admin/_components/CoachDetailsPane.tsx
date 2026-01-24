import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Phone, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type CoachProfile = {
  bio: string | null
  notes: string | null
  zip: string | null
  phone: string | null
}

type CoachMember = {
  clerkUserId: string
  status: "ACTIVE" | "DISABLED"
}

type CoachDetailsPaneProps = {
  selectedMember: CoachMember | null
  selectedInvite: {
    status: string
    lastSentLabel: string
    expiresLabel: string
  } | null
  detailsLoading: boolean
  displayName: string
  headerName: string
  email: string
  status: "ACTIVE" | "DISABLED" | "INVITED"
  membershipStatusLabel: string
  profileDraft: CoachProfile
  onDisplayNameChange: (value: string) => void
  onProfileChange: (value: CoachProfile) => void
  isProfileDirty: boolean
  profileSaving: boolean
  onCancel: () => void
  onSave: () => void
  onToggleStatus: () => void
  onResendInvite: () => void
}

function StatusChip({ status }: { status: "ACTIVE" | "DISABLED" | "INVITED" }) {
  const styles =
    status === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "DISABLED"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700"

  const label = status === "ACTIVE" ? "Enabled" : status === "DISABLED" ? "Disabled" : "Invited"

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", styles)}>
      {label}
    </span>
  )
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function CoachDetailsPane({
  selectedMember,
  selectedInvite,
  detailsLoading,
  displayName,
  headerName,
  email,
  status,
  membershipStatusLabel,
  profileDraft,
  onDisplayNameChange,
  onProfileChange,
  isProfileDirty,
  profileSaving,
  onCancel,
  onSave,
  onToggleStatus,
  onResendInvite,
}: CoachDetailsPaneProps) {
  const hasSelection = !!selectedMember || !!selectedInvite

  // One source of truth for the header UI
  const headerStatus: "ACTIVE" | "DISABLED" | "INVITED" = selectedInvite
    ? "INVITED"
    : selectedMember?.status ?? "DISABLED"

  const isEnabled = headerStatus === "ACTIVE"

  return (
    <section className="app-card flex h-full min-h-0 flex-col overflow-hidden p-5 lg:h-[calc(100vh-240px)]">
      {/* HEADER (non-scrolling) */}
      <div className="mb-5">
        {!hasSelection ? (
          <div className="space-y-2">
            <div className="text-base font-semibold text-slate-900">Coach details</div>
            <div className="text-sm text-slate-600">Select a coach to view and edit their profile.</div>
          </div>
        ) : detailsLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-xl font-semibold text-slate-900">{headerName}</div>
              <div className="truncate text-sm text-slate-500">{email}</div>
            </div>

            <div className="flex items-center gap-3">
              <StatusChip status={headerStatus} />

              {selectedMember ? (
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => onToggleStatus()}
                  aria-label="Toggle coach enabled"
                  className={cn(
                    // shadcn Switch supports data-state selectors
                    "data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                  )}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* BODY (scrolling) */}
      <div className="flex-1 min-h-0 overflow-auto">
        {!hasSelection || detailsLoading ? null : selectedMember ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="section-title">Profile</div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <div className="text-slate-700">Display name</div>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={event => onDisplayNameChange(event.target.value)}
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <div className="text-slate-700">Email</div>
                  <Input type="email" value={email} disabled />
                </label>

                <label className="space-y-2 text-sm">
                  <div className="text-slate-700">Phone</div>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="tel"
                      className="pl-9"
                      value={formatPhone(profileDraft.phone ?? "")}
                      onChange={event =>
                        onProfileChange({
                          ...profileDraft,
                          phone: formatPhone(event.target.value),
                        })
                      }
                    />
                  </div>
                </label>

                <label className="space-y-2 text-sm">
                  <div className="text-slate-700">Zip</div>
                  <Input
                    type="text"
                    value={profileDraft.zip ?? ""}
                    onChange={event =>
                      onProfileChange({ ...profileDraft, zip: event.target.value })
                    }
                  />
                </label>

                <label className="space-y-2 text-sm md:col-span-2">
                  <div className="text-slate-700">Notes</div>
                  <Textarea
                    rows={5}
                    value={profileDraft.notes ?? ""}
                    onChange={event =>
                      onProfileChange({ ...profileDraft, notes: event.target.value })
                    }
                  />
                </label>
              </div>
            </div>

            {/* Removed redundant Access block for members */}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="section-title">Access</div>
            <div className="grid gap-2 text-sm text-slate-600">
              <div>Invite status: {selectedInvite?.status}</div>
              <div>Last sent: {selectedInvite?.lastSentLabel}</div>
              <div>Expires: {selectedInvite?.expiresLabel}</div>
              <div className="text-xs text-slate-400">
                Access controls unlock after the invite is accepted.
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onResendInvite}>
                <RefreshCcw className="h-4 w-4" />
                Resend invite
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER (non-scrolling, pinned) */}
      {selectedMember && !detailsLoading ? (
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={!isProfileDirty}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={!isProfileDirty || profileSaving}>
            {profileSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
