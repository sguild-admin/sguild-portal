// modules/members/members.dto.ts
// DTOs for org membership records.
import type { OrgMembership } from "@prisma/client"
import type { MemberWithUser } from "@/modules/members/members.repo"

// Public-facing member representation.
export type MemberDTO = {
  id: string
  orgId: string
  clerkUserId: string
  role: OrgMembership["role"]
  status: OrgMembership["status"]
  user?: MemberUserDTO | null
  invitedAt: Date | null
  activatedAt: Date | null
  disabledAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Coach profile fields visible to admins.
export type MemberCoachProfileDTO = {
  bio: string | null
  notes: string | null
  zip: string | null
  phone: string | null
}

// Minimal user fields shown in roster views.
export type MemberUserDTO = {
  id: string
  clerkUserId: string
  primaryEmail: string | null
  firstName: string | null
  lastName: string | null
  displayName: string | null
  coachProfile?: MemberCoachProfileDTO | null
}

// Map Prisma OrgMembership to MemberDTO.
export function toMemberDTO(m: OrgMembership): MemberDTO {
  return {
    id: m.id,
    orgId: m.orgId,
    clerkUserId: m.clerkUserId,
    role: m.role,
    status: m.status,
    invitedAt: m.invitedAt ?? null,
    activatedAt: m.activatedAt ?? null,
    disabledAt: m.disabledAt ?? null,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}

// Map OrgMembership with user relation into a roster-friendly DTO.
export function toMemberWithUserDTO(m: MemberWithUser): MemberDTO {
  return {
    id: m.id,
    orgId: m.orgId,
    clerkUserId: m.clerkUserId,
    role: m.role,
    status: m.status,
    user: m.appUser
      ? {
          id: m.appUser.id,
          clerkUserId: m.appUser.clerkUserId,
          primaryEmail: m.appUser.primaryEmail ?? null,
          firstName: m.appUser.firstName ?? null,
          lastName: m.appUser.lastName ?? null,
          displayName: m.appUser.displayName ?? null,
          coachProfile: m.appUser.coachProfile
            ? {
                bio: m.appUser.coachProfile.bio ?? null,
                notes: m.appUser.coachProfile.notes ?? null,
                zip: m.appUser.coachProfile.zip ?? null,
                phone: m.appUser.coachProfile.phone ?? null,
              }
            : null,
        }
      : null,
    invitedAt: m.invitedAt ?? null,
    activatedAt: m.activatedAt ?? null,
    disabledAt: m.disabledAt ?? null,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}
