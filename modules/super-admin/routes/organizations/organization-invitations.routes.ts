import { GET as listInvites, POST as createInvite } from "@/modules/invitations/routes/super-admin/org-invitations.route"

export async function GET(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  return listInvites(req, ctx)
}

export async function POST(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  return createInvite(req, ctx)
}
