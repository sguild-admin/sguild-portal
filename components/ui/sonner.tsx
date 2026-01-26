"use client"

import { Toaster } from "sonner"

export function Sonner() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        duration: 3500,
      }}
    />
  )
}
