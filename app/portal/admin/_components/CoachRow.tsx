import { MoreVertical } from "lucide-react"
import StatusPill from "@/app/portal/admin/_components/StatusPill"

type CoachRowProps = {
  id: string
  name: string
  email: string
  status: "ACTIVE" | "DISABLED" | "INVITED" | "PENDING"
  lastSentLabel?: string | null
  isSelected: boolean
  isInvite: boolean
  menuOpenId: string | null
  setMenuOpenId: (value: string | null) => void
  onSelect: () => void
  onEdit?: () => void
  onToggle?: () => void
  onResend?: () => void
}

export default function CoachRow({
  id,
  name,
  email,
  status,
  lastSentLabel,
  isSelected,
  isInvite,
  menuOpenId,
  setMenuOpenId,
  onSelect,
  onEdit,
  onToggle,
  onResend,
}: CoachRowProps) {
  return (
    <div
      className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
        isSelected
          ? "border-indigo-200 bg-indigo-50/60 border-l-4 border-l-indigo-500"
          : "border-slate-200 bg-white border-l-4 border-l-transparent"
      }`}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="space-y-1">
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-xs text-slate-500">{email}</div>
        {isInvite && lastSentLabel ? (
          <div className="text-xs text-slate-400">Last sent {lastSentLabel}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={status} />
        <div className="relative">
          <button
            type="button"
            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
            onClick={event => {
              event.stopPropagation()
              setMenuOpenId(menuOpenId === id ? null : id)
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpenId === id ? (
            <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-white shadow-lg">
              {!isInvite ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={event => {
                    event.stopPropagation()
                    setMenuOpenId(null)
                    onEdit?.()
                  }}
                >
                  Edit profile
                </button>
              ) : null}
              {!isInvite ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={event => {
                    event.stopPropagation()
                    setMenuOpenId(null)
                    onToggle?.()
                  }}
                >
                  {status === "ACTIVE" ? "Disable" : "Enable"}
                </button>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={event => {
                    event.stopPropagation()
                    setMenuOpenId(null)
                    onResend?.()
                  }}
                >
                  Resend invite
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
