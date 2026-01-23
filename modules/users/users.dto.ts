// modules/users/users.dto.ts
import type { AppUser } from "@prisma/client"

export type AppUserDTO = {
  id: string
  clerkUserId: string
  isSuperAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export function toAppUserDTO(u: AppUser): AppUserDTO {
  return {
    id: u.id,
    clerkUserId: u.clerkUserId,
    isSuperAdmin: u.isSuperAdmin,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
