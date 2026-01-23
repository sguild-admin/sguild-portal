// modules/users/users.dto.ts
import type { AppUser } from "@prisma/client"

export type AppUserDTO = {
  id: string
  clerkUserId: string
  createdAt: Date
  updatedAt: Date
}

export function toAppUserDTO(u: AppUser): AppUserDTO {
  return {
    id: u.id,
    clerkUserId: u.clerkUserId,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}
