export type SuperAdminUserDto = {
  id: string
  email: string | null
  name: string | null
  role?: unknown
  createdAt?: unknown
}

export type SuperAdminOrgDto = {
  id: string
  name: string
  slug?: string | null
  logo?: string | null
  createdAt?: unknown
  _count?: { members: number }
  settings?: {
    timeZone: string
    offersOceanLessons: boolean
  } | null
}

export type SuperAdminOrgMemberDto = {
  memberId: string
  userId: string
  name: string | null
  email: string | null
  image: string | null
  role: "owner" | "admin" | "coach" | "member"
  status: "ACTIVE" | "DISABLED"
  disabledAt: Date | null
  disabledReason: string | null
  coachProfileId: string | null
  createdAt: Date
}

export function toSuperAdminUserDto(u: any): SuperAdminUserDto {
  return {
    id: String(u?.id),
    email: u?.email ?? null,
    name: u?.name ?? null,
    role: u?.role,
    createdAt: u?.createdAt,
  }
}

export function toSuperAdminOrgDto(o: any): SuperAdminOrgDto {
  return {
    id: String(o?.id),
    name: String(o?.name ?? ""),
    slug: o?.slug ?? null,
    logo: o?.logo ?? null,
    createdAt: o?.createdAt,
    _count: o?._count ? { members: Number(o._count.members ?? 0) } : undefined,
    settings: o?.settings
      ? {
          timeZone: String(o.settings.timeZone ?? "America/Chicago"),
          offersOceanLessons: Boolean(o.settings.offersOceanLessons),
        }
      : null,
  }
}

export function toSuperAdminOrgMemberDto(m: any): SuperAdminOrgMemberDto {
  return {
    memberId: String(m?.id),
    userId: String(m?.userId ?? m?.user?.id ?? ""),
    name: m?.user?.name ?? null,
    email: m?.user?.email ?? null,
    image: m?.user?.image ?? null,
    role: (m?.role ?? "member") as SuperAdminOrgMemberDto["role"],
    status: (m?.status ?? "ACTIVE") as SuperAdminOrgMemberDto["status"],
    disabledAt: m?.disabledAt ?? null,
    disabledReason: m?.disabledReason ?? null,
    coachProfileId: m?.coachProfile?.id ?? null,
    createdAt: m?.createdAt ?? new Date(),
  }
}
