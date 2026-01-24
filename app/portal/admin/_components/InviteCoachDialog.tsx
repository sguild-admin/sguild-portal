import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type InviteCoachDialogProps = {
  open: boolean
  inviteEmail: string
  inviteName: string
  inviteError: string | null
  inviteSending: boolean
  inviteSuccessEmail: string | null
  onInviteEmailChange: (value: string) => void
  onInviteNameChange: (value: string) => void
  onClose: () => void
  onSend: () => void
}

export default function InviteCoachDialog({
  open,
  inviteEmail,
  inviteName,
  inviteError,
  inviteSending,
  inviteSuccessEmail,
  onInviteEmailChange,
  onInviteNameChange,
  onClose,
  onSend,
}: InviteCoachDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Invite coach</h3>
          <button
            type="button"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {inviteSuccessEmail ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="text-base font-semibold text-slate-800">Invite sent</div>
            <div className="text-slate-500">{inviteSuccessEmail} has been invited.</div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Email address
              <Input
                type="email"
                value={inviteEmail}
                onChange={event => onInviteEmailChange(event.target.value)}
                placeholder="coach@example.com"
              />
              {inviteError ? <span className="text-xs text-red-600">{inviteError}</span> : null}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Name (optional)
              <Input
                type="text"
                value={inviteName}
                onChange={event => onInviteNameChange(event.target.value)}
                placeholder="Coach name"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={onSend} disabled={inviteSending}>
                {inviteSending ? "Sending..." : "Send invite"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
