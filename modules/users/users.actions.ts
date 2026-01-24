// modules/users/users.actions.ts
// Server actions for user provisioning and lookup.
import "server-only"

import { authzService } from "@/modules/authz/authz.service"
import { usersService } from "@/modules/users/users.service"
import { EnsureUserSchema } from "./users.schema"
import { toAppUserDTO } from "./users.dto"

// Create or fetch a user by Clerk id.
export async function ensureUserAction(input: unknown) {
  const data = EnsureUserSchema.parse(input)
  const user = await usersService.getOrCreateByClerkUserId(data.clerkUserId)
  return { user: toAppUserDTO(user) }
}

// Fetch the current user's app profile.
export async function getMyUserAction() {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)
  return { user: toAppUserDTO(user) }
}


