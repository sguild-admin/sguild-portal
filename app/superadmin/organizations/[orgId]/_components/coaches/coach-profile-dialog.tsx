/* Deprecated: replaced by Team tab. Safe to delete.
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

export type CoachProfileDialogData = {
  memberId: string
  userId: string
  name: string | null
  email: string | null
  // Deprecated: replaced by Team tab. Safe to delete.
*/
  // Deprecated: replaced by Team tab. Safe to delete.
  // Deprecated: replaced by Team tab. Safe to delete.
}

type ApiOk<T> = { ok: true; data: T }
type ApiFail = { ok: false; error: string }
type ApiResponse<T> = ApiOk<T> | ApiFail

type CoachAvailability = {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

type CoachProfileResponse = {
  id: string
  status: "ACTIVE" | "DISABLED"
  nickname: string | null
  notes: string | null
  address: string | null
  phone: string | null
  // Deprecated: replaced by Team tab. Safe to delete.
}
