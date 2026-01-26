// lib/bootstrap/types.ts
export type BootstrapPayload = {
  signedIn: boolean
  user: { id: string; email?: string | null; name?: string | null } | null
  session: {
    id?: string | null
    activeOrganizationId: string | null
    expiresAt: string | Date | null
  } | null
  activeOrg: any | null
  roles: string[]
  orgSettings: any | null
}

export type ApiOk<T> = { ok: true; data: T }
export type ApiFail = { ok: false; error: string; code?: string }
export type ApiResponse<T> = ApiOk<T> | ApiFail
