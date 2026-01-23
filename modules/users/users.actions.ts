// modules/users/users.actions.ts
import "server-only"

import { authzService } from "@/modules/authz/authz.service"
import { usersService } from "@/modules/users/users.service"
import { EnsureUserSchema } from "./users.schema"
import { toAppUserDTO } from "./users.dto"

export async function ensureUserAction(input: unknown) {
  const data = EnsureUserSchema.parse(input)
  const user = await usersService.getOrCreateByClerkUserId(data.clerkUserId)
  return { user: toAppUserDTO(user) }
}

export async function getMyUserAction() {
  const { clerkUserId } = await authzService.requireUserId()
  const user = await usersService.getOrCreateByClerkUserId(clerkUserId)
  return { user: toAppUserDTO(user) }
}


