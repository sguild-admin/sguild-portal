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
  }
}
