import { Badge } from "@/components/ui/badge"

type Status = "ACTIVE" | "DISABLED" | "INVITED"

type StatusPillProps = {
  status: Status
}

function statusLabel(status: Status) {
  if (status === "INVITED") return "Invited"
  return status === "ACTIVE" ? "Active" : "Disabled"
}

export default function StatusPill({ status }: StatusPillProps) {
  const className =
    status === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "INVITED"
        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
        : "border-slate-200 bg-slate-50 text-slate-600"

  return (
    <Badge variant="outline" className={className}>
      {statusLabel(status)}
    </Badge>
  )
}
