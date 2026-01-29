"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ConfirmDeleteDialog({
  title,
  description,
  confirmLabel,
  confirmDisabled,
  confirmLoading,
  open,
  onOpenChange,
  onConfirm,
  children,
}: {
  title: string
  description: string
  confirmLabel: string
  confirmDisabled?: boolean
  confirmLoading?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  children?: React.ReactNode
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={confirmDisabled || confirmLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLoading ? "Working..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
