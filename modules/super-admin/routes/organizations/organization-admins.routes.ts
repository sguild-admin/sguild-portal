import { GET as listAdmins, POST as createAdmin } from "@/modules/members/routes/super-admin/org-admins.route"

export async function GET(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  return listAdmins(req, ctx)
}

export async function POST(req: Request, ctx: { params: Promise<{ orgId: string }> }) {
  return createAdmin(req, ctx)
}
