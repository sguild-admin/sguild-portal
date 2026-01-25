import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import CoachRow from "@/app/portal/admin/_components/CoachRow"
import EmptyStateCard from "@/app/portal/admin/_components/EmptyStateCard"

type CoachRowItem = {
  id: string
  name: string
  email: string
  status: "ACTIVE" | "DISABLED" | "INVITED" | "PENDING"
  lastSentLabel?: string | null
  isInvite: boolean
}

type CoachRosterPaneProps = {
  totalRosterCount: number
  search: string
  onSearchChange: (value: string) => void
  filtersDisabled: boolean
  statusFilter: "ACTIVE" | "DISABLED"
  onStatusChange: (value: "ACTIVE" | "DISABLED") => void
  activeCount: number
  disabledCount: number
  isLoading: boolean
  rows: CoachRowItem[]
  selectedId: string | null
  menuOpenId: string | null
  setMenuOpenId: (value: string | null) => void
  onInviteClick: () => void
  onSelectRow: (id: string) => void
  onEditRow: (id: string) => void
  onToggleRow: (id: string) => void
  onResendInvite: (id: string) => void
}

export default function CoachRosterPane({
  totalRosterCount,
  search,
  onSearchChange,
  filtersDisabled,
  statusFilter,
  onStatusChange,
  activeCount,
  disabledCount,
  isLoading,
  rows,
  selectedId,
  menuOpenId,
  setMenuOpenId,
  onInviteClick,
  onSelectRow,
  onEditRow,
  onToggleRow,
  onResendInvite,
}: CoachRosterPaneProps) {
  const normalizedSearch = search.trim()
  const hasSearch = normalizedSearch.length > 0
  const hasItemsForFilter = statusFilter === "ACTIVE" ? activeCount > 0 : disabledCount > 0

  const emptyState = (() => {
    if (rows.length > 0) return null
    if (hasSearch && hasItemsForFilter) {
      return {
        title: "No results",
        body: `No results for “${normalizedSearch}”`,
        onInvite: undefined as (() => void) | undefined,
      }
    }

    if (statusFilter === "DISABLED") {
      return {
        title: "No disabled coaches",
        body: "Disabled coaches will appear here",
        onInvite: undefined as (() => void) | undefined,
      }
    }

    return {
      title: "No active coaches",
      body: "Invite your first coach to get started",
      onInvite: onInviteClick,
    }
  })()

  return (
    <section className="app-card flex h-140 flex-col overflow-hidden p-5 lg:h-[calc(100vh-240px)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">Coaches</div>
          <div className="text-xs text-slate-500">{totalRosterCount}</div>
        </div>
        {totalRosterCount > 0 ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="Search coaches"
              className="pl-9"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={filtersDisabled}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              statusFilter === "ACTIVE"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            } ${filtersDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() => onStatusChange("ACTIVE")}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            disabled={filtersDisabled}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              statusFilter === "DISABLED"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            } ${filtersDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() => onStatusChange("DISABLED")}
          >
            Disabled ({disabledCount})
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-auto rounded-xl bg-slate-50/40">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-2 rounded-xl border p-3">
                <div className="h-3 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : emptyState ? (
          <div className="grid h-full place-items-center p-4">
            <div className="w-full max-w-75">
              <EmptyStateCard
                title={emptyState.title}
                body={emptyState.body}
                onInvite={emptyState.onInvite}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 border-t border-slate-200/60 p-4">
            {rows.map(row => (
              <CoachRow
                key={row.id}
                id={row.id}
                name={row.name}
                email={row.email}
                status={row.status}
                lastSentLabel={row.lastSentLabel}
                isInvite={row.isInvite}
                isSelected={selectedId === row.id}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onSelect={() => onSelectRow(row.id)}
                onEdit={() => onEditRow(row.id)}
                onToggle={() => onToggleRow(row.id)}
                onResend={() => onResendInvite(row.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
