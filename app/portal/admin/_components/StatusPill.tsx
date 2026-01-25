import { Badge } from "@/components/ui/badge"

type Status = "ACTIVE" | "DISABLED" | "INVITED" | "PENDING"

type StatusPillProps = {
  status: Status
}

function statusLabel(status: Status) {
  if (status === "PENDING") return "Pending"
  if (status === "INVITED") return "Invited"
  return status === "ACTIVE" ? "Active" : "Disabled"
}

export default function StatusPill({ status }: StatusPillProps) {
  const className =
    status === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "DISABLED"
        ? "border-slate-200 bg-slate-50 text-slate-600"
        : status === "PENDING"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-indigo-200 bg-indigo-50 text-indigo-700"

  return (
    <Badge variant="outline" className={className}>
      {statusLabel(status)}
    </Badge>
  )
}
