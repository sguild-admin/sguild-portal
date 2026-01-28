"use server"

import { headers } from "next/headers"
import { invitationsService } from "./invitations.service"
import {
  createOrgInviteSchema,
  listOrgInvitesSchema,
  resendInviteSchema,
  revokeInviteSchema,
} from "./invitations.schema"

export async function listOrgInvitesAction(input: unknown) {
  const parsed = listOrgInvitesSchema.parse(input)
  return invitationsService.listOrgInvitesForSuperAdmin(await headers(), parsed)
}

export async function createOrgAdminInviteAction(input: unknown) {
  const parsed = createOrgInviteSchema.parse(input)
  return invitationsService.createOrgAdminInviteForSuperAdmin(await headers(), parsed)
}

export async function resendInviteAction(input: unknown) {
  const parsed = resendInviteSchema.parse(input)
  return invitationsService.resendInviteForSuperAdmin(await headers(), parsed)
}

export async function revokeInviteAction(input: unknown) {
  const parsed = revokeInviteSchema.parse(input)
  return invitationsService.revokeInviteForSuperAdmin(await headers(), parsed)
}
