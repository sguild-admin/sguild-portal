import type { Member, User } from "@prisma/client"

export type MemberRole = "owner" | "admin" | "member"
export type MemberStatus = "ACTIVE" | "DISABLED"

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
  status: MemberStatus
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
    organizationId: m.organizationId,
    userId: m.userId,
    role: m.role,
    status: m.status,
    createdAt: m.createdAt,
    user: m.user ? toMemberUserDto(m.user) : undefined,
  }
}
