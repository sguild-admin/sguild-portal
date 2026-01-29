"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button, type ButtonProps } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"

export type SignOutButtonProps = Omit<ButtonProps, "onClick"> & {
  redirectTo?: string
  redirectMethod?: "push" | "replace"
  onSignedOut?: () => void
  onError?: (error: unknown) => void
  showErrorToast?: boolean
  errorMessage?: string
}

export function SignOutButton({
  redirectTo = "/sign-in",
  redirectMethod = "replace",
  onSignedOut,
  onError,
  showErrorToast = false,
  errorMessage,
  ...buttonProps
}: SignOutButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authClient.signOut()

      if (onSignedOut) {
        onSignedOut()
        return
      }

      if (redirectMethod === "push") {
        router.push(redirectTo)
      } else {
        router.replace(redirectTo)
      }
      router.refresh()
    } catch (error) {
      onError?.(error)
      if (showErrorToast) {
        toast.error(errorMessage ?? (error instanceof Error ? error.message : "Sign out failed"))
      }
    }
  }

  return <Button {...buttonProps} onClick={handleSignOut} />
}
