import type { Member, OrgRole, User } from "@prisma/client"

export type MemberRole = OrgRole

export type MemberUserDto = {
  id: string
  email: string
  name: string | null
  image: string | null
}

export type MemberDto = {
  id: string
  organizationId: string
  userId: string
  role: string
  createdAt: Date
  user?: MemberUserDto
}

export function toMemberUserDto(u: User): MemberUserDto {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    image: u.image ?? null,
  }
}

export function toMemberDto(
  m: Member & { user?: User | null }
): MemberDto {
  return {
    id: m.id,
    organizationId: m.orgId,
    userId: m.userId,
    role: m.role,
    createdAt: m.createdAt,
    user: m.user ? toMemberUserDto(m.user) : undefined,
  }
}
