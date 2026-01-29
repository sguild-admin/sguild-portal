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
