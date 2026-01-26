// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"
import { Sonner } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Sguild",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Sonner />
      </body>
    </html>
  )
}
