// app/layout.tsx
// Root layout and global providers.
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sguild",
  description: "Sguild",
}

// Wrap the app with Clerk provider and global styles.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-in">
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
