import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateCardProps = {
  title: string
  body: string
  onInvite: () => void
}

export default function EmptyStateCard({ title, body, onInvite }: EmptyStateCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center text-sm shadow-sm">
      <UserPlus className="mx-auto h-8 w-8 text-slate-400" />
      <div className="mt-3 text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-slate-600">{body}</div>
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-10 border-indigo-300 px-4 text-indigo-700 hover:bg-indigo-50"
        onClick={onInvite}
      >
        Invite coach
      </Button>
    </div>
  )
}
