import type { ReactNode } from "react"

export function ContentContainer({
  children,
  size = "default",
  className = "",
}: {
  children: ReactNode
  size?: "default" | "wide"
  className?: string
}) {
  const max = size === "wide" ? "max-w-7xl" : "max-w-6xl"
  return (
    <div className={`${max} mx-auto w-full px-4 sm:px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}
