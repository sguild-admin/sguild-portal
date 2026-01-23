// modules/users/users.service.ts
import "server-only"

import type { AppUser } from "../../prisma/generated/client"
import { usersRepo } from "@/modules/users/users.repo"

export const usersService = {
  async getByClerkUserId(clerkUserId: string): Promise<AppUser | null> {
    return usersRepo.getByClerkUserId(clerkUserId)
  },

  async getOrCreateByClerkUserId(clerkUserId: string): Promise<AppUser> {
    return usersRepo.getOrCreateByClerkUserId(clerkUserId)
  },

  async setSuperAdmin(clerkUserId: string, isSuperAdmin: boolean): Promise<AppUser> {
    return usersRepo.setSuperAdmin(clerkUserId, isSuperAdmin)
  },
}
