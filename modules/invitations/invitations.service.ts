// modules/invitations/invitations.service.ts
import crypto from "crypto"
import { prisma } from "@/lib/db/prisma"
import { AppError } from "@/lib/http/errors"
import { requireSession, requireSuperAdmin } from "@/lib/auth/guards"
import { invitationsRepo } from "./invitations.repo"
import { toInvitationDto } from "./invitations.dto"
import type {
  AcceptInviteInput,
  CreateOrgInviteInput,
  ListOrgInvitesInput,
  ResendInviteInput,
  RevokeInviteInput,
} from "./invitations.schema"
import { membersRepo, type MemberRole } from "@/modules/members/members.repo"

type AuthResult =
  | { session: { userId: string }; user?: { email?: string | null } }
  | { userId: string }

function getUserIdFromAuth(auth: unknown): string {
  const a = auth as any
  if (a?.session?.userId) return String(a.session.userId)
  if (a?.userId) return String(a.userId)
  throw new AppError("UNAUTHENTICATED", "Missing session userId")
}

function getEmailFromAuth(auth: unknown): string | null {
  const a = auth as any
  const email = a?.user?.email
  if (!email) return null
  return String(email).toLowerCase()
}

async function getUserEmailById(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  return u?.email ? u.email.toLowerCase() : null
}

const INVITE_TOKEN_SECRET =
  process.env.INVITE_TOKEN_SECRET ?? process.env.BETTER_AUTH_SECRET ?? ""

function assertInviteSecret() {
  if (!INVITE_TOKEN_SECRET) throw new AppError("BAD_REQUEST", "Missing INVITE_TOKEN_SECRET")
}

function randomToken() {
  return crypto.randomBytes(32).toString("base64url")
}

function hashToken(token: string) {
  assertInviteSecret()
  return crypto.createHmac("sha256", INVITE_TOKEN_SECRET).update(token).digest("hex")
}

function last4(token: string) {
  const clean = token.replace(/[^a-zA-Z0-9]/g, "")
  const v = clean.slice(-4)
  return v.length ? v : null
}

function addDays(now: Date, days: number) {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return d
}

function appBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_URL ??
    ""

  if (!raw) throw new AppError("BAD_REQUEST", "Missing NEXT_PUBLIC_APP_URL (or APP_URL)")
  if (raw.startsWith("http")) return raw
  return `https://${raw}`
}

function buildInviteUrl(token: string) {
  return `${appBaseUrl()}/invite?token=${encodeURIComponent(token)}`
}

function normalizeMemberRole(role: string): MemberRole {
  if (role === "owner" || role === "admin" || role === "member") return role
  if (role === "coach") return "member"
  throw new AppError("BAD_REQUEST", "Invalid invite role")
}

export const invitationsService = {
  // ---------- Superadmin management ----------

  async listOrgInvitesForSuperAdmin(headers: Headers, input: ListOrgInvitesInput) {
    await requireSuperAdmin(headers)
    const rows = await invitationsRepo.listByOrg({ orgId: input.orgId })
    return rows.map(toInvitationDto)
  },

  async createOrgAdminInviteForSuperAdmin(headers: Headers, input: CreateOrgInviteInput) {
    const auth = (await requireSuperAdmin(headers)) as AuthResult
    const inviterId = getUserIdFromAuth(auth)
    const now = new Date()

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    })

    if (existingUser) {
      const member = await prisma.member.findFirst({
        where: { orgId: input.orgId, userId: existingUser.id },
        select: { role: true },
      })

      if (member?.role) {
        throw new AppError("BAD_REQUEST", `Already has role: ${member.role}`)
      }
    }

    const pendingSameRole = await invitationsRepo.findPendingByOrgEmailRole({
      orgId: input.orgId,
      email: input.email,
      role: input.role,
    })

    if (!pendingSameRole) {
      await invitationsRepo.revokePendingByOrgEmailRoleNot({
        orgId: input.orgId,
        email: input.email,
        role: input.role,
        revokedAt: now,
      })
    }

    const raw = randomToken()
    const expiresAt = addDays(now, input.expiresInDays)

    const invite = pendingSameRole
      ? await invitationsRepo.updateTokenAndResend({
          inviteId: pendingSameRole.id,
          tokenHash: hashToken(raw),
          tokenLast4: last4(raw),
          expiresAt,
          lastSentAt: now,
        })
      : await invitationsRepo.create({
          orgId: input.orgId,
          email: input.email,
          role: input.role,
          expiresAt,
          inviterId,
          tokenHash: hashToken(raw),
          tokenLast4: last4(raw),
          lastSentAt: now,
        })

    return { invite: toInvitationDto(invite), inviteUrl: buildInviteUrl(raw) }
  },

  async resendInviteForSuperAdmin(headers: Headers, input: ResendInviteInput) {
    await requireSuperAdmin(headers)
    const now = new Date()

    const invite = await invitationsRepo.findById({ inviteId: input.inviteId })
    if (!invite) throw new AppError("NOT_FOUND", "Invite not found")
    if (invite.acceptedAt) throw new AppError("BAD_REQUEST", "Invite already accepted")
    if (invite.revokedAt) throw new AppError("BAD_REQUEST", "Invite revoked")

    const raw = randomToken()
    const updated = await invitationsRepo.updateTokenAndResend({
      inviteId: invite.id,
      tokenHash: hashToken(raw),
      tokenLast4: last4(raw),
      expiresAt: addDays(now, input.expiresInDays),
      lastSentAt: now,
    })

    return { invite: toInvitationDto(updated), inviteUrl: buildInviteUrl(raw) }
  },

  async revokeInviteForSuperAdmin(headers: Headers, input: RevokeInviteInput) {
    await requireSuperAdmin(headers)
    const now = new Date()

    const invite = await invitationsRepo.findById({ inviteId: input.inviteId })
    if (!invite) throw new AppError("NOT_FOUND", "Invite not found")
    if (invite.acceptedAt) throw new AppError("BAD_REQUEST", "Invite already accepted")
    if (invite.revokedAt) return toInvitationDto(invite)

    const updated = await invitationsRepo.revoke({ inviteId: invite.id, revokedAt: now })
    return toInvitationDto(updated)
  },

  // ---------- Public acceptance ----------

  async acceptInvite(headers: Headers, input: AcceptInviteInput) {
    const auth = (await requireSession(headers)) as AuthResult
    const userId = getUserIdFromAuth(auth)
    const now = new Date()

    const inv = await invitationsRepo.findByTokenHash({ tokenHash: hashToken(input.token) })
    if (!inv) throw new AppError("NOT_FOUND", "Invalid invite token")
    if (inv.revokedAt) throw new AppError("FORBIDDEN", "Invite revoked")
    if (inv.acceptedAt) throw new AppError("BAD_REQUEST", "Invite already accepted")
    if (inv.expiresAt.getTime() <= now.getTime()) throw new AppError("FORBIDDEN", "Invite expired")

    const emailFromGuard = getEmailFromAuth(auth)
    const userEmail = emailFromGuard ?? (await getUserEmailById(userId))
    if (!userEmail || userEmail !== inv.email.toLowerCase()) {
      throw new AppError("FORBIDDEN", "Signed-in email does not match invite")
    }

    const role = normalizeMemberRole(inv.role)

    await membersRepo.upsertByUserAndOrg(userId, inv.organizationId, role)

    const updated = await invitationsRepo.markAccepted({ inviteId: inv.id, acceptedAt: now })
    return toInvitationDto(updated)
  },
}
