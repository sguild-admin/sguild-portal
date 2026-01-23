// app/layout.tsx
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sguild",
  description: "Sguild",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="min-h-full antialiased text-slate-800 bg-sky-50">
          <div
            id="content"
            className="min-h-screen bg-linear-to-b from-sky-50 to-white text-slate-800"
          >
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
